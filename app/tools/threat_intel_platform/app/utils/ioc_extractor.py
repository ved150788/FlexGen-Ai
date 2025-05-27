import re
from typing import List, Dict, Any, Tuple

# Regular expressions for different IOC types
IPV4_PATTERN = r'(?:^|\s|\[|\()((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:$|\s|\]|\))'
DOMAIN_PATTERN = r'(?:^|\s|\[|\()([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:$|\s|\]|\))'
URL_PATTERN = r'(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))'
MD5_PATTERN = r'(?:^|\s|\[|\()([a-fA-F0-9]{32})(?:$|\s|\]|\))'
SHA1_PATTERN = r'(?:^|\s|\[|\()([a-fA-F0-9]{40})(?:$|\s|\]|\))'
SHA256_PATTERN = r'(?:^|\s|\[|\()([a-fA-F0-9]{64})(?:$|\s|\]|\))'
EMAIL_PATTERN = r'(?:^|\s|\[|\()([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:$|\s|\]|\))'

# Blacklists for common false positives
IP_BLACKLIST = {
    '127.0.0.1', '0.0.0.0', '255.255.255.255', '1.1.1.1', '8.8.8.8', '8.8.4.4',
    '192.168.0.1', '192.168.1.1', '10.0.0.1', '172.16.0.1'
}

DOMAIN_BLACKLIST = {
    'example.com', 'test.com', 'domain.com', 'google.com', 'microsoft.com', 
    'apple.com', 'amazon.com', 'facebook.com', 'github.com', 'gitlab.com'
}

def extract_iocs(text: str) -> Dict[str, List[str]]:
    """
    Extract various IOCs from text using regex
    
    Args:
        text: Text to extract IOCs from
        
    Returns:
        Dictionary with IOC types as keys and lists of values as values
    """
    iocs = {
        'ip': set(),
        'domain': set(),
        'url': set(),
        'md5': set(),
        'sha1': set(),
        'sha256': set(),
        'email': set()
    }
    
    # Extract IP addresses
    for match in re.finditer(IPV4_PATTERN, text, re.IGNORECASE):
        ip = match.group().strip('() []')
        if ip not in IP_BLACKLIST:
            iocs['ip'].add(ip)
    
    # Extract domains
    for match in re.finditer(DOMAIN_PATTERN, text, re.IGNORECASE):
        domain = match.group().strip('() []')
        if domain not in DOMAIN_BLACKLIST:
            iocs['domain'].add(domain)
    
    # Extract URLs
    for match in re.finditer(URL_PATTERN, text, re.IGNORECASE):
        url = match.group().strip('() []')
        iocs['url'].add(url)
    
    # Extract MD5 hashes
    for match in re.finditer(MD5_PATTERN, text, re.IGNORECASE):
        md5 = match.group().strip('() []')
        iocs['md5'].add(md5)
    
    # Extract SHA1 hashes
    for match in re.finditer(SHA1_PATTERN, text, re.IGNORECASE):
        sha1 = match.group().strip('() []')
        iocs['sha1'].add(sha1)
    
    # Extract SHA256 hashes
    for match in re.finditer(SHA256_PATTERN, text, re.IGNORECASE):
        sha256 = match.group().strip('() []')
        iocs['sha256'].add(sha256)
    
    # Extract email addresses
    for match in re.finditer(EMAIL_PATTERN, text, re.IGNORECASE):
        email = match.group().strip('() []')
        iocs['email'].add(email)
    
    # Convert sets to lists for JSON serialization
    return {k: list(v) for k, v in iocs.items()}

def extract_and_normalize(text: str, source: str, source_url: str = None, 
                          tags: List[str] = None, confidence: float = 0.5) -> List[Dict[str, Any]]:
    """
    Extract IOCs and normalize them into a standard format
    
    Args:
        text: Text to extract IOCs from
        source: Name of source (e.g., 'AlienVault', 'Pastebin')
        source_url: URL where IOC was found
        tags: List of tags to apply to IOCs
        confidence: Confidence score (0.0 to 1.0)
        
    Returns:
        List of normalized IOC dictionaries ready for database insertion
    """
    iocs_dict = extract_iocs(text)
    normalized_iocs = []
    
    if tags is None:
        tags = []
    
    for ioc_type, values in iocs_dict.items():
        for value in values:
            normalized_iocs.append({
                'type': ioc_type,
                'value': value,
                'source': source,
                'source_url': source_url,
                'confidence': confidence,
                'tags': tags,
                'context': text[:500] if len(text) > 500 else text,  # Store excerpt of context
            })
    
    return normalized_iocs 