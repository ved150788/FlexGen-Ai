"""
Database schema for the Threat Intelligence Platform

This module defines the database models for storing and organizing threat intelligence data
"""

# Restore the original import
from app.tools.threat_intel_platform.app import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy import event, text, ForeignKey
from sqlalchemy.orm import relationship

# Association tables for many-to-many relationships

# Tags to IOCs
ioc_tags = db.Table('ioc_tags',
    db.Column('ioc_id', db.Integer, db.ForeignKey('iocs.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# IOCs to Campaigns
ioc_campaigns = db.Table('ioc_campaigns',
    db.Column('ioc_id', db.Integer, db.ForeignKey('iocs.id'), primary_key=True),
    db.Column('campaign_id', db.Integer, db.ForeignKey('campaigns.id'), primary_key=True)
)

# Threat Actors to Campaigns
actor_campaigns = db.Table('actor_campaigns',
    db.Column('actor_id', db.Integer, db.ForeignKey('threat_actors.id'), primary_key=True),
    db.Column('campaign_id', db.Integer, db.ForeignKey('campaigns.id'), primary_key=True)
)

# IOCs to Vulnerabilities
ioc_vulnerabilities = db.Table('ioc_vulnerabilities',
    db.Column('ioc_id', db.Integer, db.ForeignKey('iocs.id'), primary_key=True),
    db.Column('vulnerability_id', db.Integer, db.ForeignKey('vulnerabilities.id'), primary_key=True)
)

class Tag(db.Model):
    """Tags for categorizing IOCs and other entities"""
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=True)  # e.g., malware, tooling, sector
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Tag {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description
        }

class FeedRun(db.Model):
    """Records of feed crawler executions"""
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
    
    def to_dict(self):
        return {
            'id': self.id,
            'feed_name': self.feed_name,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'items_processed': self.items_processed,
            'items_added': self.items_added,
            'items_updated': self.items_updated,
            'error_message': self.error_message
        }

class IOC(db.Model):
    """Base model for all Indicators of Compromise"""
    __tablename__ = 'iocs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), default=lambda: str(uuid.uuid4()), unique=True)
    type = db.Column(db.String(50), nullable=False, index=True)  # ip, domain, url, md5, sha1, sha256, etc.
    value = db.Column(db.String(2048), nullable=False, index=True)  # The actual IOC value
    source = db.Column(db.String(100), nullable=False, index=True)  # AlienVault, Abuse.ch, etc.
    source_url = db.Column(db.String(2048))  # Original URL where IOC was found
    first_seen = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # Optional expiration date
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    context = db.Column(db.Text)  # Additional context from source
    tlp = db.Column(db.String(20), default='white')  # Traffic Light Protocol marking
    active = db.Column(db.Boolean, default=True)  # Whether the IOC is still active
    false_positive = db.Column(db.Boolean, default=False)  # Marked as false positive
    false_positive_reason = db.Column(db.Text)  # Reason for false positive
    
    # Relationships
    tags = relationship('Tag', secondary=ioc_tags, backref=db.backref('iocs', lazy='dynamic'))
    campaigns = relationship('Campaign', secondary=ioc_campaigns, backref=db.backref('iocs', lazy='dynamic'))
    vulnerabilities = relationship('Vulnerability', secondary=ioc_vulnerabilities, backref=db.backref('iocs', lazy='dynamic'))
    
    # Type-specific relations (set based on IOC type)
    ip_details_id = db.Column(db.Integer, db.ForeignKey('ip_details.id'))
    ip_details = relationship('IPDetails', backref='ioc', uselist=False)
    
    domain_details_id = db.Column(db.Integer, db.ForeignKey('domain_details.id'))
    domain_details = relationship('DomainDetails', backref='ioc', uselist=False)
    
    url_details_id = db.Column(db.Integer, db.ForeignKey('url_details.id'))
    url_details = relationship('URLDetails', backref='ioc', uselist=False)
    
    file_details_id = db.Column(db.Integer, db.ForeignKey('file_details.id'))
    file_details = relationship('FileDetails', backref='ioc', uselist=False)
    
    # Store additional metadata as JSON
    meta_data = db.Column(db.JSON, default=dict)  # Additional metadata
    enrichment = db.Column(db.JSON, default=dict)  # Enrichment data
    
    # User annotations
    notes = db.Column(db.Text)
    manual_tags = db.Column(db.JSON, default=list)  # Manual tags added by users
    
    def __repr__(self):
        return f"<IOC {self.type}:{self.value}>"
    
    def to_dict(self, include_details=False):
        """Convert IOC to dictionary for API responses"""
        result = {
            'id': self.id,
            'uuid': self.uuid,
            'type': self.type,
            'value': self.value,
            'source': self.source,
            'source_url': self.source_url,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'confidence': self.confidence,
            'context': self.context,
            'tlp': self.tlp,
            'active': self.active,
            'false_positive': self.false_positive,
            'tags': [tag.name for tag in self.tags],
            'meta_data': self.meta_data,
            'enrichment': self.enrichment,
            'notes': self.notes,
            'manual_tags': self.manual_tags
        }
        
        # Include type-specific details if requested
        if include_details:
            if self.type == 'ip' and self.ip_details:
                result['details'] = self.ip_details.to_dict()
            elif self.type in ['domain', 'hostname'] and self.domain_details:
                result['details'] = self.domain_details.to_dict()
            elif self.type == 'url' and self.url_details:
                result['details'] = self.url_details.to_dict()
            elif self.type in ['md5', 'sha1', 'sha256', 'sha512'] and self.file_details:
                result['details'] = self.file_details.to_dict()
        
        return result

class IPDetails(db.Model):
    """Additional details for IP address IOCs"""
    __tablename__ = 'ip_details'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Geolocation info
    country = db.Column(db.String(2))
    country_name = db.Column(db.String(100))
    region = db.Column(db.String(100))
    city = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Network info
    asn = db.Column(db.Integer)  # Autonomous System Number
    as_name = db.Column(db.String(200))  # AS Name
    isp = db.Column(db.String(200))  # Internet Service Provider
    
    # Classification
    is_tor = db.Column(db.Boolean, default=False)
    is_proxy = db.Column(db.Boolean, default=False)
    is_malicious = db.Column(db.Boolean)
    is_datacenter = db.Column(db.Boolean, default=False)
    
    # Additional metadata
    reputation_score = db.Column(db.Float)  # 0-100 score
    whois = db.Column(db.Text)
    reverse_dns = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'country': self.country,
            'country_name': self.country_name,
            'city': self.city,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'asn': self.asn,
            'as_name': self.as_name,
            'isp': self.isp,
            'is_tor': self.is_tor,
            'is_proxy': self.is_proxy,
            'is_malicious': self.is_malicious,
            'is_datacenter': self.is_datacenter,
            'reputation_score': self.reputation_score,
            'reverse_dns': self.reverse_dns
        }

class DomainDetails(db.Model):
    """Additional details for domain IOCs"""
    __tablename__ = 'domain_details'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Registration info
    registrar = db.Column(db.String(255))
    creation_date = db.Column(db.DateTime)
    expiration_date = db.Column(db.DateTime)
    updated_date = db.Column(db.DateTime)
    
    # DNS info
    nameservers = db.Column(db.JSON, default=list)
    a_records = db.Column(db.JSON, default=list)
    mx_records = db.Column(db.JSON, default=list)
    txt_records = db.Column(db.JSON, default=list)
    
    # Classification
    is_dga = db.Column(db.Boolean, default=False)  # Domain Generation Algorithm
    is_typosquat = db.Column(db.Boolean, default=False)
    is_subdomain = db.Column(db.Boolean, default=False)
    is_parked = db.Column(db.Boolean, default=False)
    
    # Reputation
    reputation_score = db.Column(db.Float)  # 0-100 score
    category = db.Column(db.String(100))  # e.g., malware, phishing, etc.
    
    # WHOIS data
    whois = db.Column(db.Text)
    registrant_name = db.Column(db.String(255))
    registrant_email = db.Column(db.String(255))
    registrant_org = db.Column(db.String(255))
    
    # SSL info 
    ssl_info = db.Column(db.JSON, default=dict)
    
    def to_dict(self):
        return {
            'registrar': self.registrar,
            'creation_date': self.creation_date.isoformat() if self.creation_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'nameservers': self.nameservers,
            'a_records': self.a_records,
            'is_dga': self.is_dga,
            'is_typosquat': self.is_typosquat,
            'reputation_score': self.reputation_score,
            'category': self.category,
            'registrant_org': self.registrant_org,
            'ssl_info': self.ssl_info
        }

class URLDetails(db.Model):
    """Additional details for URL IOCs"""
    __tablename__ = 'url_details'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # URL components
    scheme = db.Column(db.String(10))  # http, https, ftp
    domain = db.Column(db.String(255))
    path = db.Column(db.String(2048))
    query_string = db.Column(db.String(2048))
    fragment = db.Column(db.String(255))
    port = db.Column(db.Integer)
    
    # Classification
    category = db.Column(db.String(100))  # phishing, malware, etc.
    is_shortened = db.Column(db.Boolean, default=False)
    final_url = db.Column(db.String(2048))  # After following redirects
    
    # Content info
    title = db.Column(db.String(1024))
    mime_type = db.Column(db.String(100))
    status_code = db.Column(db.Integer)
    
    # Security checks
    contains_exploit = db.Column(db.Boolean)
    contains_malware = db.Column(db.Boolean)
    contains_phishing = db.Column(db.Boolean)
    
    # Screenshot info
    screenshot_path = db.Column(db.String(1024))
    
    def to_dict(self):
        return {
            'scheme': self.scheme,
            'domain': self.domain,
            'path': self.path,
            'query_string': self.query_string,
            'port': self.port,
            'category': self.category,
            'is_shortened': self.is_shortened,
            'final_url': self.final_url,
            'title': self.title,
            'status_code': self.status_code,
            'contains_exploit': self.contains_exploit,
            'contains_malware': self.contains_malware,
            'contains_phishing': self.contains_phishing,
            'screenshot_path': self.screenshot_path
        }

class FileDetails(db.Model):
    """Additional details for file hash IOCs"""
    __tablename__ = 'file_details'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # File identifiers
    md5 = db.Column(db.String(32), index=True)
    sha1 = db.Column(db.String(40), index=True)
    sha256 = db.Column(db.String(64), index=True)
    sha512 = db.Column(db.String(128))
    ssdeep = db.Column(db.String(255))  # Fuzzy hash
    
    # File metadata
    file_name = db.Column(db.String(1024))
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(100))
    mime_type = db.Column(db.String(100))
    
    # Analysis results
    malware_family = db.Column(db.String(100))
    malware_type = db.Column(db.String(100))  # e.g., ransomware, trojan, etc.
    threat_level = db.Column(db.Integer)  # 0-10
    
    # Sample info
    compilation_timestamp = db.Column(db.DateTime)
    signature = db.Column(db.JSON, default=dict)
    imphash = db.Column(db.String(32))  # Import hash
    
    # AV detection
    first_seen = db.Column(db.DateTime)
    detection_ratio = db.Column(db.String(20))  # e.g., 20/60
    av_labels = db.Column(db.JSON, default=dict)  # Map of AV vendor to detection name
    
    # Sandbox analysis
    behavioral_indicators = db.Column(db.JSON, default=list)
    network_indicators = db.Column(db.JSON, default=list)
    file_indicators = db.Column(db.JSON, default=list)
    
    def to_dict(self):
        return {
            'md5': self.md5,
            'sha1': self.sha1,
            'sha256': self.sha256,
            'ssdeep': self.ssdeep,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'mime_type': self.mime_type,
            'malware_family': self.malware_family,
            'malware_type': self.malware_type,
            'threat_level': self.threat_level,
            'detection_ratio': self.detection_ratio,
            'av_labels': self.av_labels,
            'behavioral_indicators': self.behavioral_indicators,
            'network_indicators': self.network_indicators
        }

class ThreatActor(db.Model):
    """Information about threat actors/groups"""
    __tablename__ = 'threat_actors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    aliases = db.Column(db.JSON, default=list)  # Alternative names
    description = db.Column(db.Text)
    motivation = db.Column(db.String(100))  # e.g., financial, espionage, hacktivism
    sophistication = db.Column(db.Integer)  # 1-10
    first_seen = db.Column(db.DateTime)
    last_seen = db.Column(db.DateTime)
    country = db.Column(db.String(2))  # Country code
    sponsored_by = db.Column(db.String(100))  # State sponsor if applicable
    
    # Common TTPs (Tactics, Techniques, Procedures)
    ttp_ids = db.Column(db.JSON, default=list)  # MITRE ATT&CK IDs
    tools = db.Column(db.JSON, default=list)  # Known tools used
    
    # Metadata
    sources = db.Column(db.JSON, default=list)  # Information sources
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    notes = db.Column(db.Text)
    
    # Relationships
    # campaigns is defined through actor_campaigns table
    
    def __repr__(self):
        return f"<ThreatActor {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'aliases': self.aliases,
            'description': self.description,
            'motivation': self.motivation,
            'sophistication': self.sophistication,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'country': self.country,
            'sponsored_by': self.sponsored_by,
            'ttp_ids': self.ttp_ids,
            'tools': self.tools,
            'sources': self.sources,
            'confidence': self.confidence,
            'campaigns': [c.name for c in self.campaigns]
        }

class Campaign(db.Model):
    """Information about malicious campaigns"""
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    first_seen = db.Column(db.DateTime)
    last_seen = db.Column(db.DateTime)
    status = db.Column(db.String(20))  # active, inactive, unknown
    
    # Target information
    target_countries = db.Column(db.JSON, default=list)  # Country codes
    target_industries = db.Column(db.JSON, default=list)  # Industry sectors
    target_types = db.Column(db.JSON, default=list)  # e.g., government, financial, etc.
    
    # TTP information
    ttp_ids = db.Column(db.JSON, default=list)  # MITRE ATT&CK IDs
    malware_families = db.Column(db.JSON, default=list)  # Known malware families
    
    # Metadata
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    sources = db.Column(db.JSON, default=list)  # Information sources
    notes = db.Column(db.Text)
    tlp = db.Column(db.String(20), default='white')  # Traffic Light Protocol
    
    # Relationships
    # threat_actors is defined through actor_campaigns table
    # iocs is defined through ioc_campaigns table
    
    def __repr__(self):
        return f"<Campaign {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'status': self.status,
            'target_countries': self.target_countries,
            'target_industries': self.target_industries,
            'target_types': self.target_types,
            'ttp_ids': self.ttp_ids,
            'malware_families': self.malware_families,
            'confidence': self.confidence,
            'sources': self.sources,
            'tlp': self.tlp,
            'threat_actors': [a.name for a in self.threat_actors],
            'ioc_count': self.iocs.count()
        }

class Vulnerability(db.Model):
    """Information about vulnerabilities"""
    __tablename__ = 'vulnerabilities'
    
    id = db.Column(db.Integer, primary_key=True)
    cve_id = db.Column(db.String(20), nullable=False, unique=True, index=True)  # CVE-YYYY-NNNNN
    name = db.Column(db.String(255))  # Common name if any
    description = db.Column(db.Text)
    
    # CVSS details
    cvss_v3_score = db.Column(db.Float)
    cvss_v3_vector = db.Column(db.String(100))
    cvss_v2_score = db.Column(db.Float)
    cvss_v2_vector = db.Column(db.String(100))
    
    # Vulnerability details
    cwe_id = db.Column(db.String(20))  # CWE-NNN
    affected_products = db.Column(db.JSON, default=list)
    affected_versions = db.Column(db.JSON, default=list)
    
    # Dates
    published_date = db.Column(db.DateTime)
    last_modified_date = db.Column(db.DateTime)
    
    # Exploitation details
    exploit_available = db.Column(db.Boolean, default=False)
    exploited_in_wild = db.Column(db.Boolean, default=False)
    exploit_urls = db.Column(db.JSON, default=list)
    
    # Remediation
    patch_available = db.Column(db.Boolean, default=False)
    patch_urls = db.Column(db.JSON, default=list)
    workarounds = db.Column(db.Text)
    
    # References and metadata
    references = db.Column(db.JSON, default=list)
    notes = db.Column(db.Text)
    
    # Relationships
    # iocs is defined through ioc_vulnerabilities table
    
    def __repr__(self):
        return f"<Vulnerability {self.cve_id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'cve_id': self.cve_id,
            'name': self.name,
            'description': self.description,
            'cvss_v3_score': self.cvss_v3_score,
            'cvss_v3_vector': self.cvss_v3_vector,
            'cwe_id': self.cwe_id,
            'affected_products': self.affected_products,
            'affected_versions': self.affected_versions,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'exploit_available': self.exploit_available,
            'exploited_in_wild': self.exploited_in_wild,
            'patch_available': self.patch_available,
            'references': self.references,
            'ioc_count': self.iocs.count()
        }

class Relationship(db.Model):
    """Relationships between different IOCs"""
    __tablename__ = 'relationships'
    
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, db.ForeignKey('iocs.id'), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey('iocs.id'), nullable=False)
    relationship_type = db.Column(db.String(50), nullable=False)  # e.g., 'resolves_to', 'communicates_with', 'drops'
    description = db.Column(db.Text)
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    source_ref = db.Column(db.String(255))  # Reference to the source of this relationship
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    source = db.relationship('IOC', foreign_keys=[source_id], backref='outgoing_relationships')
    target = db.relationship('IOC', foreign_keys=[target_id], backref='incoming_relationships')
    
    def __repr__(self):
        return f"<Relationship {self.source_id} {self.relationship_type} {self.target_id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'source_id': self.source_id,
            'target_id': self.target_id,
            'relationship_type': self.relationship_type,
            'description': self.description,
            'confidence': self.confidence,
            'source_ref': self.source_ref,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'source': self.source.to_dict(include_details=False) if self.source else None,
            'target': self.target.to_dict(include_details=False) if self.target else None
        }

class Event(db.Model):
    """Security events related to IOCs"""
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)  # detection, alert, scan, etc.
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    source = db.Column(db.String(100))  # Source of the event (e.g., SIEM, EDR)
    severity = db.Column(db.Integer)  # 1-10
    confidence = db.Column(db.Float, default=0.5)  # 0.0 to 1.0
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='new')  # new, investigating, resolved, false_positive
    
    # Event details
    source_ip = db.Column(db.String(45))
    destination_ip = db.Column(db.String(45))
    source_port = db.Column(db.Integer)
    destination_port = db.Column(db.Integer)
    protocol = db.Column(db.String(10))
    
    # Timestamps
    first_seen = db.Column(db.DateTime)
    last_seen = db.Column(db.DateTime)
    
    # Related IOCs
    related_iocs = db.Column(db.JSON, default=list)  # List of IOC UUIDs
    
    # Additional metadata
    meta_data = db.Column(db.JSON, default=dict)
    
    def __repr__(self):
        return f"<Event {self.id}: {self.title}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'title': self.title,
            'description': self.description,
            'source': self.source,
            'severity': self.severity,
            'confidence': self.confidence,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'source_ip': self.source_ip,
            'destination_ip': self.destination_ip,
            'source_port': self.source_port,
            'destination_port': self.destination_port,
            'protocol': self.protocol,
            'first_seen': self.first_seen.isoformat() if self.first_seen else None,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'related_iocs': self.related_iocs,
            'meta_data': self.meta_data
        }

# Create indexes for faster querying with DDL statements
@event.listens_for(IOC.__table__, 'after_create')
def create_ioc_indexes(target, connection, **kw):
    connection.execute(text("CREATE INDEX ix_iocs_type_value ON iocs (type, value)"))
    connection.execute(text("CREATE INDEX ix_iocs_first_seen ON iocs (first_seen)"))
    connection.execute(text("CREATE INDEX ix_iocs_last_seen ON iocs (last_seen)"))
    connection.execute(text("CREATE INDEX ix_iocs_confidence ON iocs (confidence)"))

@event.listens_for(Event.__table__, 'after_create')
def create_event_indexes(target, connection, **kw):
    connection.execute(text("CREATE INDEX ix_events_timestamp ON events (timestamp)"))
    connection.execute(text("CREATE INDEX ix_events_severity ON events (severity)"))

@event.listens_for(Vulnerability.__table__, 'after_create')
def create_vulnerability_indexes(target, connection, **kw):
    connection.execute(text("CREATE INDEX ix_vulnerabilities_cvss_v3_score ON vulnerabilities (cvss_v3_score)")) 