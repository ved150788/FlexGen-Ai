"""
Utility functions for the API Fuzzer
"""

import json
import logging
import random
import string
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

# Configure logging
def setup_logger(level: int = logging.INFO) -> None:
    """Configure the logger for the API Fuzzer"""
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )

# Common attack strings for testing
ATTACK_STRINGS = {
    "sql_injection": [
        "' OR 1=1 --",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "1'; SELECT * FROM users WHERE 't' = 't",
        "' OR '1'='1"
    ],
    "xss": [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert(1)",
        "<svg onload=alert(1)>",
        "\"><script>alert(1)</script>"
    ],
    "nosql_injection": [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "sleep(10000)"}',
        '{"$regex": ".*"}',
        '{ "$gt": 0 }'
    ],
    "command_injection": [
        "| ls -la",
        "; cat /etc/passwd",
        "` ping -c 10 127.0.0.1`",
        "$(cat /etc/passwd)",
        "& echo vulnerable &"
    ],
    "path_traversal": [
        "../../../etc/passwd",
        "..\\..\\..\\Windows\\system.ini",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "file:///etc/passwd",
        "/var/www/../../../etc/passwd"
    ]
}

# Data generation utilities
def generate_random_string(length: int = 10) -> str:
    """Generate a random string of fixed length"""
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

def generate_random_number(min_val: int = 0, max_val: int = 1000) -> int:
    """Generate a random integer between min_val and max_val"""
    return random.randint(min_val, max_val)

def generate_random_boolean() -> bool:
    """Generate a random boolean value"""
    return random.choice([True, False])

def generate_random_date(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> str:
    """Generate a random date string in ISO format"""
    if start_date is None:
        start_date = datetime.now() - timedelta(days=365)
    if end_date is None:
        end_date = datetime.now() + timedelta(days=365)
    
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    random_date = start_date + timedelta(days=random_days)
    
    return random_date.isoformat()

def get_attack_string(attack_type: str = None) -> str:
    """Get a random attack string of the specified type, or any type if None"""
    if attack_type and attack_type in ATTACK_STRINGS:
        return random.choice(ATTACK_STRINGS[attack_type])
    else:
        attack_type = random.choice(list(ATTACK_STRINGS.keys()))
        return random.choice(ATTACK_STRINGS[attack_type])

def generate_fuzzed_value(data_type: str, format_type: Optional[str] = None, 
                          min_val: Optional[Any] = None, max_val: Optional[Any] = None,
                          enum_values: Optional[List[Any]] = None, include_attacks: bool = True) -> Any:
    """Generate a fuzzed value based on the data type and format"""
    
    # 5% chance to return an attack string if attacks are included
    if include_attacks and random.random() < 0.05:
        attack_category = random.choice(list(ATTACK_STRINGS.keys()))
        return random.choice(ATTACK_STRINGS[attack_category])
    
    # Handle enum values specially - either return a valid value or invalid one
    if enum_values:
        if random.random() < 0.9:  # 90% chance to return a valid enum value
            return random.choice(enum_values)
        else:  # 10% chance to return an invalid value
            return f"{generate_random_string()}_INVALID_ENUM"
    
    # Generate different test cases based on type
    if data_type == "string":
        test_case_type = random.randint(1, 5)
        
        if test_case_type == 1:  # Empty string
            return ""
        elif test_case_type == 2:  # Normal string
            if format_type == "date":
                return generate_random_date()
            elif format_type == "date-time":
                return generate_random_date()
            elif format_type == "email":
                return f"{generate_random_string(8)}@{generate_random_string(5)}.com"
            elif format_type == "uri" or format_type == "url":
                return f"https://{generate_random_string(8)}.com/{generate_random_string(5)}"
            else:
                return generate_random_string(random.randint(5, 15))
        elif test_case_type == 3:  # Oversized string
            # Generate a very long string to test size limits
            return generate_random_string(random.randint(1000, 10000))
        elif test_case_type == 4:  # Single character
            return random.choice(string.ascii_letters)
        else:  # Special characters
            special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/"
            return ''.join(random.choice(special_chars) for _ in range(random.randint(5, 10)))
            
    elif data_type == "number" or data_type == "integer":
        test_case_type = random.randint(1, 5)
        
        if test_case_type == 1:  # Zero
            return 0
        elif test_case_type == 2:  # Negative number
            return -generate_random_number(1, 1000)
        elif test_case_type == 3:  # Max int test
            return 2147483647  # Max 32-bit signed integer
        elif test_case_type == 4:  # Min int test
            return -2147483648  # Min 32-bit signed integer
        else:  # Normal number
            return generate_random_number(min_val or 0, max_val or 1000)
            
    elif data_type == "boolean":
        return generate_random_boolean()
        
    elif data_type == "array":
        test_case_type = random.randint(1, 3)
        
        if test_case_type == 1:  # Empty array
            return []
        elif test_case_type == 2:  # Small array
            return [generate_random_string() for _ in range(random.randint(1, 5))]
        else:  # Large array
            return [generate_random_string() for _ in range(random.randint(20, 50))]
            
    elif data_type == "object":
        test_case_type = random.randint(1, 3)
        
        if test_case_type == 1:  # Empty object
            return {}
        elif test_case_type == 2:  # Simple object
            return {
                generate_random_string(5): generate_random_string()
                for _ in range(random.randint(1, 3))
            }
        else:  # Nested object
            return {
                generate_random_string(5): {
                    generate_random_string(5): generate_random_string()
                    for _ in range(random.randint(1, 3))
                }
                for _ in range(random.randint(1, 3))
            }
    else:
        # Default to a string for unknown types
        return generate_random_string()

# Request throttling
def calculate_sleep_time(rate_limit: float, last_request_time: float) -> float:
    """Calculate sleep time to respect rate limiting"""
    if rate_limit <= 0:
        return 0
    
    min_interval = 1.0 / rate_limit
    current_time = datetime.now().timestamp()
    elapsed = current_time - last_request_time
    
    if elapsed < min_interval:
        return min_interval - elapsed
    return 0

# Helper for parsing headers
def parse_headers(headers_str: str) -> Dict[str, str]:
    """Parse headers from a JSON string or dict"""
    if not headers_str:
        return {}
    
    if isinstance(headers_str, dict):
        return headers_str
    
    try:
        return json.loads(headers_str)
    except json.JSONDecodeError:
        logging.error(f"Failed to parse headers: {headers_str}")
        return {} 