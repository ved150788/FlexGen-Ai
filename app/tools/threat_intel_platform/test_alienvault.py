#!/usr/bin/env python3
"""
Test script to verify AlienVault OTX API key works correctly
"""

import requests
import json
import sys
from datetime import datetime, timedelta

API_KEY = "61b8bc7b26584345ce93d6ac72ce015ec6c37e9f1ae37fc99ba2951acbdea1a2"
BASE_URL = "https://otx.alienvault.com/api/v1"

def test_api_key():
    """Test if the API key is valid by retrieving user details"""
    headers = {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FlexGenThreatIntel/1.0'
    }
    
    # Get user details
    response = requests.get(f"{BASE_URL}/user", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"API Key is valid!")
        print(f"Username: {user_data.get('username')}")
        print(f"Email: {user_data.get('email')}")
        return True
    else:
        print(f"Error: API key validation failed with status {response.status_code}")
        print(f"Response: {response.text}")
        return False

def get_recent_pulses():
    """Get recent pulses from subscriptions"""
    headers = {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FlexGenThreatIntel/1.0'
    }
    
    # Get pulses from the last 24 hours
    since = datetime.now() - timedelta(hours=24)
    params = {
        'modified_since': since.isoformat()
    }
    
    response = requests.get(f"{BASE_URL}/pulses/subscribed", headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f"\nRetrieved {len(results)} pulses from the last 24 hours")
        
        # Print out the first 5 pulses
        for i, pulse in enumerate(results[:5]):
            print(f"\nPulse {i+1}:")
            print(f"  Name: {pulse.get('name')}")
            print(f"  Author: {pulse.get('author_name')}")
            print(f"  Created: {pulse.get('created')}")
            print(f"  Tags: {', '.join(pulse.get('tags', []))}")
            
        return True
    else:
        print(f"Error: Failed to retrieve pulses with status {response.status_code}")
        print(f"Response: {response.text}")
        return False

def get_ip_reputation(ip):
    """Get reputation data for an IP address"""
    headers = {
        'X-OTX-API-KEY': API_KEY,
        'User-Agent': 'FlexGenThreatIntel/1.0'
    }
    
    response = requests.get(f"{BASE_URL}/indicators/IPv4/{ip}/general", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nIP Reputation for {ip}:")
        print(f"  Pulse Count: {data.get('pulse_info', {}).get('count', 0)}")
        print(f"  Reputation: {data.get('reputation', 0)}")
        return True
    else:
        print(f"Error: Failed to retrieve IP reputation with status {response.status_code}")
        print(f"Response: {response.text}")
        return False

if __name__ == "__main__":
    print("AlienVault OTX API Test Script")
    print("==============================")
    
    # Test API key
    if not test_api_key():
        sys.exit(1)
    
    # Get recent pulses
    if not get_recent_pulses():
        sys.exit(1)
    
    # Test IP reputation for a known malicious IP
    get_ip_reputation("185.244.39.81")
    
    print("\nAPI testing completed successfully!") 