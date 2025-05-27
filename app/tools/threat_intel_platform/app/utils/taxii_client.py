"""
TAXII Client for fetching threat intelligence from TAXII servers

This module provides functionality to connect to TAXII servers and fetch STIX data.
It also supports direct API access to AlienVault OTX.
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
import time
from typing import List, Dict, Any, Optional

import stix2
from taxii2client.v20 import Server, Collection
from taxii2client.v21 import Server as Server21
from taxii2client.v21 import Collection as Collection21

from app.tools.threat_intel_platform.app import db
from app.tools.threat_intel_platform.app.models.schema import IOC, FeedRun

logger = logging.getLogger(__name__)

# Default TAXII servers if not specified in environment
DEFAULT_TAXII_SERVERS = [
    {
        "name": "MITRE ATT&CK",
        "url": "https://cti-taxii.mitre.org/taxii/",
        "version": "2.1",
        "collection_name": "enterprise-attack",
        "username": None,
        "password": None
    },
    {
        "name": "AlienVault OTX",
        "url": "https://otx.alienvault.com/api/v1/indicators/export",
        "version": "direct",
        "api_key": "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
    }
]

def get_taxii_servers() -> List[Dict[str, Any]]:
    """
    Get TAXII server configurations from environment or use defaults
    """
    try:
        # Try to load from environment variable
        taxii_config_str = os.environ.get('TAXII_SERVERS')
        if taxii_config_str:
            return json.loads(taxii_config_str)
        
        # Fall back to default servers
        return DEFAULT_TAXII_SERVERS
    except Exception as e:
        logger.error(f"Error loading TAXII server configurations: {str(e)}")
        return DEFAULT_TAXII_SERVERS

def connect_to_server(server_config: Dict[str, Any]):
    """
    Connect to a TAXII server based on configuration
    """
    try:
        # If using direct API access (not TAXII), return the config
        if server_config.get('version') == 'direct':
            return server_config
            
        url = server_config.get('url')
        version = server_config.get('version', '2.0')
        username = server_config.get('username')
        password = server_config.get('password')
        
        auth = None
        if username and password:
            auth = (username, password)
            
        if version == '2.1':
            return Server21(url, auth=auth)
        else:
            return Server(url, auth=auth)
    except Exception as e:
        logger.error(f"Error connecting to TAXII server {server_config.get('name')}: {str(e)}")
        return None

def get_collection(server, server_config: Dict[str, Any]):
    """
    Get a specific collection from a TAXII server
    """
    # Direct API access doesn't use collections
    if server_config.get('version') == 'direct':
        return server
        
    try:
        collection_name = server_config.get('collection_name')
        api_root = server.api_roots[0]
        
        for collection in api_root.collections:
            if collection.title == collection_name or collection.id == collection_name:
                return collection
        
        logger.warning(f"Collection {collection_name} not found on {server_config.get('name')}")
        return None
    except Exception as e:
        logger.error(f"Error getting collection from {server_config.get('name')}: {str(e)}")
        return None

def fetch_from_alienvault_otx(server_config: Dict[str, Any]):
    """
    Fetch indicators directly from AlienVault OTX API
    
    Args:
        server_config: Configuration for AlienVault OTX API
        
    Returns:
        List of IOC objects
    """
    iocs = []
    api_key = server_config.get('api_key')
    
    if not api_key:
        logger.error("No API key provided for AlienVault OTX")
        return iocs
        
    try:
        # Get pulse indicators
        headers = {
            'X-OTX-API-KEY': api_key,
            'User-Agent': 'FlexGenThreatIntel/1.0'
        }
        
        # Get indicators from pulses created/modified in the last 30 days
        since = (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%S')
        url = f"https://otx.alienvault.com/api/v1/indicators/export?modified_since={since}&limit=1000"
        
        logger.info(f"Fetching indicators from AlienVault OTX with API key: {'*' * 8 + api_key[-4:]}")
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Error fetching from AlienVault OTX: {response.status_code} - {response.text}")
            return iocs
            
        # Parse the lines (OTX returns one JSON object per line)
        lines = response.text.splitlines()
        
        for line in lines:
            try:
                indicator_data = json.loads(line)
                
                # Map AlienVault fields to our IOC model
                indicator_type = indicator_data.get('type')
                indicator_value = indicator_data.get('indicator')
                
                # Map AlienVault types to our types
                type_mapping = {
                    'IPv4': 'ip',
                    'IPv6': 'ip',
                    'domain': 'domain',
                    'hostname': 'domain',
                    'URL': 'url',
                    'FileHash-MD5': 'hash',
                    'FileHash-SHA1': 'hash',
                    'FileHash-SHA256': 'hash',
                    'email': 'email'
                }
                
                our_type = type_mapping.get(indicator_type)
                if not our_type or not indicator_value:
                    continue
                    
                # Create IOC object
                ioc = IOC()
                ioc.type = our_type
                ioc.value = indicator_value
                ioc.source = "AlienVault OTX"
                
                # Add timestamps
                created = indicator_data.get('created')
                if created:
                    try:
                        ioc.created_at = datetime.strptime(created, '%Y-%m-%dT%H:%M:%S.%f')
                    except ValueError:
                        # Try alternate format
                        ioc.created_at = datetime.strptime(created, '%Y-%m-%dT%H:%M:%S')
                
                # Set last seen to now
                ioc.last_seen = datetime.utcnow()
                
                # Set confidence score based on OTX indicator count
                pulse_count = indicator_data.get('pulse_count', 0)
                if pulse_count > 20:
                    ioc.confidence_score = 9.5
                elif pulse_count > 10:
                    ioc.confidence_score = 8.5
                elif pulse_count > 5:
                    ioc.confidence_score = 7.5
                elif pulse_count > 2:
                    ioc.confidence_score = 6.5
                else:
                    ioc.confidence_score = 5.0
                
                # Add description if available
                if indicator_data.get('description'):
                    ioc.description = indicator_data.get('description')
                
                # Set reference link
                ioc.reference_link = f"https://otx.alienvault.com/indicator/{indicator_type}/{indicator_value}"
                
                # Set tags
                tags = []
                if indicator_data.get('pulse_info') and indicator_data.get('pulse_info').get('pulses'):
                    for pulse in indicator_data.get('pulse_info').get('pulses'):
                        if pulse.get('name'):
                            tags.append(pulse.get('name'))
                        if pulse.get('tags'):
                            tags.extend(pulse.get('tags'))
                
                # Remove duplicates and save tags
                if tags:
                    ioc.tags = json.dumps(list(set(tags)))
                
                iocs.append(ioc)
                
            except Exception as e:
                logger.error(f"Error processing AlienVault OTX indicator: {str(e)}")
                continue
                
        logger.info(f"Fetched {len(iocs)} indicators from AlienVault OTX")
        return iocs
        
    except Exception as e:
        logger.error(f"Error fetching from AlienVault OTX: {str(e)}")
        return iocs

def parse_stix_objects(objects, source: str) -> List[IOC]:
    """
    Parse STIX objects into IOC models
    """
    iocs = []
    
    for obj in objects:
        try:
            # Only process indicators
            if getattr(obj, 'type', '') != 'indicator':
                continue
                
            # Extract pattern and determine IOC type
            pattern = getattr(obj, 'pattern', '')
            if not pattern:
                continue
                
            ioc_type = None
            value = None
            
            # Parse different indicator types from STIX pattern
            if '[ipv4-addr:value' in pattern:
                ioc_type = 'ip'
                value = pattern.split("'")[1]
            elif '[domain-name:value' in pattern:
                ioc_type = 'domain'
                value = pattern.split("'")[1]
            elif '[url:value' in pattern:
                ioc_type = 'url'
                value = pattern.split("'")[1]
            elif '[file:hashes' in pattern:
                ioc_type = 'hash'
                value = pattern.split("'")[1]
            elif '[email-addr:value' in pattern:
                ioc_type = 'email'
                value = pattern.split("'")[1]
            else:
                # Skip indicators we don't know how to process
                continue
                
            if not value:
                continue
                
            # Create IOC object
            ioc = IOC()
            ioc.value = value
            ioc.type = ioc_type
            ioc.source = source
            
            # Extract timestamps
            valid_from = getattr(obj, 'valid_from', None)
            if valid_from:
                ioc.created_at = valid_from
                
            valid_until = getattr(obj, 'valid_until', None)
            ioc.last_seen = valid_until if valid_until else datetime.utcnow()
            
            # Extract confidence score
            confidence = 50  # Default medium confidence
            
            # Some STIX objects have confidence in different places
            if hasattr(obj, 'confidence'):
                confidence = obj.confidence
            
            # Normalize confidence to 0-100 scale
            ioc.confidence_score = min(100, max(0, confidence))
            
            # Extract description
            ioc.description = getattr(obj, 'description', '')
            
            # Extract reference URL if available
            if hasattr(obj, 'external_references') and obj.external_references:
                for ref in obj.external_references:
                    if hasattr(ref, 'url'):
                        ioc.reference_link = ref.url
                        break
            
            # Extract labels/tags if available
            if hasattr(obj, 'labels') and obj.labels:
                ioc.tags = json.dumps(obj.labels)
                
            iocs.append(ioc)
        except Exception as e:
            logger.error(f"Error parsing STIX object: {str(e)}")
            continue
    
    return iocs

def fetch_and_store_intelligence():
    """
    Fetch intelligence from all configured TAXII servers and store in database
    """
    total_iocs = 0
    
    for server_config in get_taxii_servers():
        try:
            logger.info(f"Fetching data from {server_config.get('name')}")
            
            # Record the feed run
            feed_run = FeedRun(
                feed_name=server_config.get('name'),
                start_time=datetime.utcnow(),
                status='running'
            )
            db.session.add(feed_run)
            db.session.commit()
            
            iocs = []
            
            # Handle direct API access differently
            if server_config.get('version') == 'direct':
                if server_config.get('name') == 'AlienVault OTX':
                    iocs = fetch_from_alienvault_otx(server_config)
            else:
                # Connect to TAXII server
                server = connect_to_server(server_config)
                if not server:
                    feed_run.status = 'failed'
                    feed_run.error_message = 'Failed to connect to server'
                    feed_run.end_time = datetime.utcnow()
                    db.session.commit()
                    continue
                
                # Get collection
                collection = get_collection(server, server_config)
                if not collection:
                    feed_run.status = 'failed'
                    feed_run.error_message = 'Failed to get collection'
                    feed_run.end_time = datetime.utcnow()
                    db.session.commit()
                    continue
                
                # Set time filter for last 30 days
                added_after = datetime.utcnow() - timedelta(days=30)
                
                # Fetch objects from collection
                try:
                    # Different API for TAXII 2.0 vs 2.1
                    if server_config.get('version') == '2.1':
                        response = collection.get_objects(added_after=added_after)
                        objects = response.get('objects', [])
                    else:
                        objects = list(collection.get_objects(added_after=added_after))
                
                    # Parse objects into IOCs
                    iocs = parse_stix_objects(objects, server_config.get('name'))
                    
                except Exception as e:
                    logger.error(f"Error fetching objects from {server_config.get('name')}: {str(e)}")
                    feed_run.status = 'failed'
                    feed_run.error_message = str(e)
                    feed_run.end_time = datetime.utcnow()
                    db.session.commit()
                    continue
            
            # Store IOCs in database
            added_count = 0
            updated_count = 0
            
            for ioc in iocs:
                try:
                    # Check if IOC already exists
                    existing = db.session.query(IOC).filter_by(
                        type=ioc.type, 
                        value=ioc.value
                    ).first()
                    
                    if existing:
                        # Update existing IOC
                        existing.last_seen = ioc.last_seen
                        
                        # Update confidence score if higher
                        if ioc.confidence_score > existing.confidence_score:
                            existing.confidence_score = ioc.confidence_score
                            
                        # Update tags if available
                        if ioc.tags:
                            try:
                                existing_tags = json.loads(existing.tags) if existing.tags else []
                                new_tags = json.loads(ioc.tags)
                                combined_tags = list(set(existing_tags + new_tags))
                                existing.tags = json.dumps(combined_tags)
                            except:
                                # If JSON parsing fails, just set the new tags
                                existing.tags = ioc.tags
                                
                        updated_count += 1
                    else:
                        # Add new IOC
                        db.session.add(ioc)
                        added_count += 1
                    
                except Exception as e:
                    logger.error(f"Error storing IOC {ioc.value}: {str(e)}")
                    continue
            
            # Commit all changes
            db.session.commit()
            
            # Update feed run status
            feed_run.status = 'success' 
            feed_run.items_processed = len(iocs)
            feed_run.items_added = added_count
            feed_run.items_updated = updated_count
            feed_run.end_time = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Added {added_count} new IOCs and updated {updated_count} existing IOCs from {server_config.get('name')}")
            total_iocs += added_count
            
        except Exception as e:
            logger.error(f"Error processing feed {server_config.get('name')}: {str(e)}")
            
            # Update feed run status if it exists
            try:
                feed_run = db.session.query(FeedRun).filter_by(
                    feed_name=server_config.get('name'),
                    status='running'
                ).order_by(FeedRun.start_time.desc()).first()
                
                if feed_run:
                    feed_run.status = 'failed'
                    feed_run.error_message = str(e)
                    feed_run.end_time = datetime.utcnow()
                    db.session.commit()
            except:
                pass
    
    return total_iocs

# Additional TAXII servers that can be configured
"""
Other public TAXII servers that can be added to configuration:

1. MITRE ATT&CK
   URL: https://cti-taxii.mitre.org/taxii/
   Collections: enterprise-attack, mobile-attack, ics-attack

2. Abuse.ch Feodo Tracker (Requires registration)
   URL: https://feodotracker.abuse.ch/taxii/

3. AlienVault OTX (Requires API key)
   URL: https://otx.alienvault.com/taxii/

4. CISA AIS (Requires registration)
   URL: https://indicators.cisa.gov/taxii/

5. IBM X-Force (Requires subscription)
   URL: https://api.xforce.ibmcloud.com/taxii/

To configure additional TAXII sources, set the TAXII_SERVERS environment variable
with a JSON array of server configurations.
""" 