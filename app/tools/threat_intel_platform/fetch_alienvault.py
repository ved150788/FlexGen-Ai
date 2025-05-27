#!/usr/bin/env python3
"""
Script to fetch and process AlienVault OTX data directly
"""

import os
import sys
import requests
import json
from datetime import datetime, timedelta
import sqlite3
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("alienvault_fetcher")

# AlienVault API configuration
API_KEY = "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
BASE_URL = "https://otx.alienvault.com/api/v1"
HOURS_BACK = 24

# Database setup
DB_PATH = "threat_intel.db"

def setup_database():
    """Set up the SQLite database if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create IOC table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ioc (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        source TEXT NOT NULL,
        confidence_score REAL DEFAULT 0.5,
        first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        reference_link TEXT,
        tags TEXT,
        UNIQUE(type, value)
    )
    ''')
    
    # Create feed_run table to track runs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feed_run (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_name TEXT NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        items_added INTEGER DEFAULT 0,
        status TEXT,
        error_message TEXT
    )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized")

def get_otx_pulses(modified_since):
    """
    Get pulses from AlienVault OTX
    
    Args:
        modified_since: Datetime object for filtering by last modification
        
    Returns:
        List of pulse dictionaries
    """
    headers = {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FlexGenThreatIntel/1.0'
    }
    
    # Format date for API
    params = {
        'modified_since': modified_since.isoformat()
    }
    
    try:
        logger.info(f"Fetching pulses modified since {modified_since.isoformat()}")
        response = requests.get(f"{BASE_URL}/pulses/subscribed", headers=headers, params=params)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch pulses: {response.status_code} {response.text}")
            return []
        
        data = response.json()
        pulses = data.get('results', [])
        logger.info(f"Fetched {len(pulses)} pulses")
        return pulses
    
    except Exception as e:
        logger.error(f"Error fetching pulses: {str(e)}")
        return []

def get_indicators_for_pulse(pulse_id):
    """
    Get all indicators for a specific pulse
    
    Args:
        pulse_id: ID of the pulse
        
    Returns:
        List of indicator dictionaries
    """
    headers = {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FlexGenThreatIntel/1.0'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/pulses/{pulse_id}/indicators", headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch indicators for pulse {pulse_id}: {response.status_code}")
            return []
        
        data = response.json()
        return data.get('results', [])
    
    except Exception as e:
        logger.error(f"Error fetching indicators for pulse {pulse_id}: {str(e)}")
        return []

def process_indicators(indicators, pulse_data):
    """
    Process indicators and store them in the database
    
    Args:
        indicators: List of indicator dictionaries
        pulse_data: Dictionary containing pulse information
        
    Returns:
        Number of indicators added to the database
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    pulse_name = pulse_data.get('name', 'Unknown')
    pulse_url = f"https://otx.alienvault.com/pulse/{pulse_data.get('id')}"
    tags = json.dumps(pulse_data.get('tags', []))
    
    # Map AlienVault types to our types
    type_map = {
        'IPv4': 'ip',
        'IPv6': 'ip',
        'domain': 'domain',
        'hostname': 'domain',
        'URL': 'url',
        'URI': 'url',
        'FileHash-MD5': 'md5',
        'FileHash-SHA1': 'sha1',
        'FileHash-SHA256': 'sha256'
    }
    
    added_count = 0
    
    for indicator in indicators:
        av_type = indicator.get('type')
        value = indicator.get('indicator')
        
        if not av_type or not value:
            continue
        
        # Map the type
        ioc_type = type_map.get(av_type)
        if not ioc_type:
            continue  # Skip unsupported types
        
        # Calculate confidence based on pulse reputation, validation, etc.
        confidence = 0.5  # Default
        if indicator.get('validations', []):
            confidence += 0.2
        
        try:
            # Insert or update the IOC
            cursor.execute('''
            INSERT INTO ioc (type, value, source, confidence_score, description, reference_link, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(type, value) DO UPDATE SET
                last_seen = CURRENT_TIMESTAMP,
                confidence_score = MAX(confidence_score, excluded.confidence_score),
                tags = excluded.tags
            ''', (
                ioc_type,
                value,
                'alienvault',
                confidence,
                pulse_name,
                pulse_url,
                tags
            ))
            
            # Count only if it was a new insert
            if cursor.rowcount > 0:
                added_count += 1
                
            # Commit every 50 inserts
            if added_count % 50 == 0:
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error inserting indicator {ioc_type}:{value}: {str(e)}")
    
    # Final commit
    conn.commit()
    conn.close()
    
    return added_count

def record_feed_run(status, items_added=0, error=None):
    """Record the feed run in the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    end_time = datetime.utcnow().isoformat()
    
    cursor.execute('''
    UPDATE feed_run SET 
        end_time = ?, 
        items_added = ?, 
        status = ?,
        error_message = ?
    WHERE id = (SELECT MAX(id) FROM feed_run WHERE feed_name = 'alienvault')
    ''', (end_time, items_added, status, error))
    
    conn.commit()
    conn.close()

def main():
    """Main function to fetch and process AlienVault data"""
    try:
        # Initialize database
        setup_database()
        
        # Record the start of the run
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO feed_run (feed_name, status)
        VALUES (?, ?)
        ''', ('alienvault', 'running'))
        conn.commit()
        conn.close()
        
        # Calculate the time range
        since = datetime.utcnow() - timedelta(hours=HOURS_BACK)
        
        # Get pulses
        pulses = get_otx_pulses(since)
        
        total_indicators = 0
        
        # Process each pulse
        for pulse in pulses:
            pulse_id = pulse.get('id')
            if not pulse_id:
                continue
            
            # Get indicators for the pulse
            indicators = get_indicators_for_pulse(pulse_id)
            logger.info(f"Processing {len(indicators)} indicators from pulse {pulse.get('name')}")
            
            # Process the indicators
            added = process_indicators(indicators, pulse)
            total_indicators += added
        
        # Record successful completion
        record_feed_run('success', total_indicators)
        
        logger.info(f"Successfully processed {len(pulses)} pulses and added {total_indicators} indicators")
        return 0
        
    except Exception as e:
        logger.error(f"Error in main function: {str(e)}")
        record_feed_run('failed', 0, str(e))
        return 1

if __name__ == "__main__":
    sys.exit(main())
