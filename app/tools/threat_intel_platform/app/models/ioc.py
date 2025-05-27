from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class IOC(db.Model):
    """Model for Indicators of Compromise"""
    __tablename__ = 'iocs'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False, index=True)  # ip, domain, url, hash, etc.
    value = db.Column(db.String(512), nullable=False, index=True)  # The actual IOC value
    source = db.Column(db.String(100), nullable=False, index=True)  # AlienVault, Abuse.ch, etc.
    source_url = db.Column(db.String(1024))  # Original URL where IOC was found
    first_seen = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    tags = db.Column(db.JSON, default=list)  # List of tags
    context = db.Column(db.Text)  # Additional context from source
    metadata = db.Column(db.JSON, default=dict)  # Additional metadata
    
    def __repr__(self):
        return f"<IOC {self.type}:{self.value}>"
    
    def to_dict(self):
        """Convert IOC to dictionary for API responses"""
        return {
            'id': self.id,
            'type': self.type,
            'value': self.value,
            'source': self.source,
            'source_url': self.source_url,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'confidence': self.confidence,
            'tags': self.tags,
            'context': self.context,
            'metadata': self.metadata
        }

# Define a model for feed history tracking
class FeedRun(db.Model):
    """Model to track feed crawl history"""
    __tablename__ = 'feed_runs'
    
    id = db.Column(db.Integer, primary_key=True)
    feed_name = db.Column(db.String(100), nullable=False, index=True)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='running')  # running, success, failed
    items_processed = db.Column(db.Integer, default=0)
    items_added = db.Column(db.Integer, default=0)
    items_updated = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text)
    
    def __repr__(self):
        return f"<FeedRun {self.feed_name} {self.start_time}>" 