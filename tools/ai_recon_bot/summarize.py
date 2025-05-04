import re
from datetime import datetime

def summarize_recon_output(recon_data):
    """
    Generate a summary of the reconnaissance data, highlighting key findings and risks.
    
    Args:
        recon_data (dict): The complete reconnaissance data
        
    Returns:
        dict: A summary containing risk counts and textual summary
    """
    findings = []
    high_risks = 0
    medium_risks = 0
    low_risks = 0
    
    # Initialize the summary text
    summary_parts = []
    
    # Domain Information
    domain = recon_data.get("target_domain", "Unknown Domain")
    
    # Process WHOIS information
    whois_data = recon_data.get("whois", {})
    if whois_data and not isinstance(whois_data, str) and not whois_data.get("error"):
        registration_date = whois_data.get("creation_date")
        expiry_date = whois_data.get("expiration_date")
        
        if registration_date:
            # Try to convert to date if it's a string
            if isinstance(registration_date, str):
                try:
                    registration_date = datetime.strptime(registration_date, "%Y-%m-%d")
                except ValueError:
                    try:
                        registration_date = datetime.strptime(registration_date, "%Y-%m-%dT%H:%M:%S")
                    except ValueError:
                        pass
            
            summary_parts.append(f"The domain {domain} was registered on {registration_date}.")
        
        # Check for domain expiration
        if expiry_date:
            # Try to convert to date if it's a string
            if isinstance(expiry_date, str):
                try:
                    expiry_date = datetime.strptime(expiry_date, "%Y-%m-%d")
                except ValueError:
                    try:
                        expiry_date = datetime.strptime(expiry_date, "%Y-%m-%dT%H:%M:%S")
                    except ValueError:
                        pass
            
            # Calculate days until expiration
            if isinstance(expiry_date, datetime):
                days_until_expiry = (expiry_date - datetime.now()).days
                
                if days_until_expiry < 30:
                    findings.append({
                        "name": "Domain Expiration Warning",
                        "description": f"The domain is set to expire in {days_until_expiry} days.",
                        "risk_level": "Medium" if days_until_expiry < 7 else "Low",
                        "details": {
                            "expiration_date": str(expiry_date),
                            "days_remaining": days_until_expiry
                        }
                    })
                    
                    if days_until_expiry < 7:
                        medium_risks += 1
                        summary_parts.append(f"⚠️ ALERT: Domain will expire in {days_until_expiry} days.")
                    else:
                        low_risks += 1
                        summary_parts.append(f"The domain will expire in {days_until_expiry} days.")
        
        # Check for WHOIS privacy
        if "privacy" in whois_data:
            privacy_enabled = whois_data.get("privacy", False)
            if not privacy_enabled:
                findings.append({
                    "name": "WHOIS Privacy Not Enabled",
                    "description": "The domain registration information is publicly visible, potentially exposing personal or organization details.",
                    "risk_level": "Low",
                    "details": {
                        "registrant": whois_data.get("registrant", "Unknown"),
                        "email": whois_data.get("email", "Unknown"),
                        "recommendation": "Enable WHOIS privacy protection through your domain registrar."
                    }
                })
                low_risks += 1
                summary_parts.append("WHOIS privacy protection is not enabled, exposing registration details.")
    
    # Process SSL Certificate Information
    ssl_data = recon_data.get("ssl", {})
    if ssl_data and not isinstance(ssl_data, str) and not ssl_data.get("error"):
        # Check for SSL expiration
        if "expiry_days" in ssl_data:
            expiry_days = ssl_data.get("expiry_days")
            
            if expiry_days < 0:
                findings.append({
                    "name": "SSL Certificate Expired",
                    "description": "The SSL certificate has expired, leaving encrypted connections vulnerable.",
                    "risk_level": "High",
                    "details": {
                        "expired_days_ago": abs(expiry_days),
                        "expiry_date": ssl_data.get("not_after", "Unknown"),
                        "recommendation": "Renew the SSL certificate immediately."
                    }
                })
                high_risks += 1
                summary_parts.append("🚨 CRITICAL: SSL certificate has already expired.")
            elif expiry_days < 15:
                findings.append({
                    "name": "SSL Certificate Near Expiration",
                    "description": f"The SSL certificate will expire in {expiry_days} days.",
                    "risk_level": "Medium",
                    "details": {
                        "days_until_expiry": expiry_days,
                        "expiry_date": ssl_data.get("not_after", "Unknown"),
                        "recommendation": "Renew the SSL certificate soon to avoid service disruption."
                    }
                })
                medium_risks += 1
                summary_parts.append(f"⚠️ ALERT: SSL certificate will expire in {expiry_days} days.")
        
        # Check for weak SSL cipher suites
        if "weak_ciphers" in ssl_data and ssl_data.get("weak_ciphers", False):
            findings.append({
                "name": "Weak SSL Cipher Suites",
                "description": "The server supports weak cipher suites that may be vulnerable to attacks.",
                "risk_level": "Medium",
                "details": {
                    "ciphers": ssl_data.get("ciphers", []),
                    "recommendation": "Configure the server to disable weak cipher suites."
                }
            })
            medium_risks += 1
            summary_parts.append("The server supports weak SSL cipher suites, potentially allowing downgrade attacks.")
        
        # Check for self-signed certificates
        if ssl_data.get("self_signed", False):
            findings.append({
                "name": "Self-Signed SSL Certificate",
                "description": "The server is using a self-signed certificate which browsers will flag as untrusted.",
                "risk_level": "Medium",
                "details": {
                    "issuer": ssl_data.get("issuer", "Unknown"),
                    "recommendation": "Purchase and install a properly signed certificate from a trusted Certificate Authority."
                }
            })
            medium_risks += 1
            summary_parts.append("The server is using a self-signed SSL certificate, which browsers will warn users about.")
    
    # Process HTTP Headers
    http_headers = recon_data.get("http_headers", {})
    if http_headers and not isinstance(http_headers, str) and not http_headers.get("error"):
        # Check for missing security headers
        security_headers = {
            "Strict-Transport-Security": "HSTS enforces secure connections to the server.",
            "Content-Security-Policy": "CSP prevents cross-site scripting (XSS) and data injection attacks.",
            "X-Content-Type-Options": "Prevents MIME-type sniffing attacks.",
            "X-Frame-Options": "Prevents clickjacking attacks.",
            "X-XSS-Protection": "Enables browser-based XSS filtering."
        }
        
        missing_headers = []
        for header, description in security_headers.items():
            if not http_headers.get(header):
                missing_headers.append({
                    "header": header,
                    "description": description
                })
        
        if missing_headers:
            findings.append({
                "name": "Missing Security Headers",
                "description": f"The server is missing {len(missing_headers)} recommended security headers.",
                "risk_level": "Medium" if len(missing_headers) > 2 else "Low",
                "details": {
                    "missing_headers": missing_headers,
                    "recommendation": "Configure the web server to include the missing security headers."
                }
            })
            
            if len(missing_headers) > 2:
                medium_risks += 1
            else:
                low_risks += 1
                
            summary_parts.append(f"The server is missing {len(missing_headers)} important security headers.")
    
    # Process Open Ports
    open_ports = recon_data.get("open_ports", {})
    if open_ports and not isinstance(open_ports, str) and not open_ports.get("error"):
        ports_list = open_ports.get("open_ports", [])
        
        # Check for unnecessary open ports
        high_risk_ports = [21, 22, 23, 25, 53, 3306, 3389]
        found_high_risk_ports = []
        
        for port in ports_list:
            if port in high_risk_ports:
                found_high_risk_ports.append(port)
        
        if found_high_risk_ports:
            findings.append({
                "name": "High Risk Ports Exposed",
                "description": f"The server has {len(found_high_risk_ports)} potentially risky ports open to the internet.",
                "risk_level": "High",
                "details": {
                    "exposed_ports": found_high_risk_ports,
                    "recommendation": "Close unnecessary ports or restrict access with a firewall."
                }
            })
            high_risks += 1
            summary_parts.append(f"🚨 CRITICAL: {len(found_high_risk_ports)} high-risk ports are exposed: {', '.join(map(str, found_high_risk_ports))}.")
        
        # General open ports notification
        if len(ports_list) > 3:
            findings.append({
                "name": "Multiple Open Ports",
                "description": f"The server has {len(ports_list)} open ports, which increases the attack surface.",
                "risk_level": "Medium",
                "details": {
                    "open_ports": ports_list,
                    "recommendation": "Close unnecessary ports to reduce attack surface."
                }
            })
            medium_risks += 1
            summary_parts.append(f"The server has {len(ports_list)} open ports, expanding the potential attack surface.")
    
    # Process CDN/WAF Information
    cdn_waf = recon_data.get("cdn_waf", {})
    if cdn_waf and not isinstance(cdn_waf, str) and not cdn_waf.get("error"):
        # Check for WAF
        waf_detected = cdn_waf.get("waf_detected", False)
        if not waf_detected:
            findings.append({
                "name": "No Web Application Firewall Detected",
                "description": "The server does not appear to be protected by a Web Application Firewall.",
                "risk_level": "Medium",
                "details": {
                    "recommendation": "Implement a WAF solution to protect against common web attacks."
                }
            })
            medium_risks += 1
            summary_parts.append("No Web Application Firewall (WAF) was detected, leaving the site more vulnerable to attacks.")
    
    # Process Subdomain Information
    subdomains = recon_data.get("subdomains", {})
    if subdomains and not isinstance(subdomains, str) and not subdomains.get("error"):
        subdomain_list = subdomains.get("subdomains", [])
        
        if len(subdomain_list) > 10:
            findings.append({
                "name": "Large Number of Subdomains",
                "description": f"Found {len(subdomain_list)} subdomains, increasing the potential attack surface.",
                "risk_level": "Low",
                "details": {
                    "subdomains": subdomain_list,
                    "recommendation": "Review and remove unnecessary subdomains to reduce attack surface."
                }
            })
            low_risks += 1
            summary_parts.append(f"Discovered {len(subdomain_list)} subdomains that may expand the attack surface.")
    
    # Process Directory Fingerprinting
    dir_fingerprint = recon_data.get("directory_fingerprint", [])
    if dir_fingerprint and isinstance(dir_fingerprint, list) and dir_fingerprint:
        # Check for sensitive directories
        high_risk_dirs = []
        
        for dir_info in dir_fingerprint:
            if isinstance(dir_info, dict) and dir_info.get("risk") == "High":
                high_risk_dirs.append(dir_info)
        
        if high_risk_dirs:
            findings.append({
                "name": "Sensitive Directories Exposed",
                "description": f"Found {len(high_risk_dirs)} potentially sensitive directories or files.",
                "risk_level": "High",
                "details": {
                    "exposed_paths": [d.get("path") for d in high_risk_dirs],
                    "recommendation": "Restrict access to sensitive directories or remove them if unnecessary."
                }
            })
            high_risks += 1
            summary_parts.append(f"🚨 CRITICAL: {len(high_risk_dirs)} sensitive directories/files are exposed.")
    
    # Process Rate Limiting/CAPTCHA
    rate_limit = recon_data.get("rate_limit", [])
    if rate_limit and isinstance(rate_limit, list) and rate_limit:
        # Check for lack of rate limiting
        has_rate_limiting = False
        
        for check in rate_limit:
            if isinstance(check, dict) and check.get("rate_limit_detected", False):
                has_rate_limiting = True
                break
        
        if not has_rate_limiting:
            findings.append({
                "name": "No Rate Limiting Detected",
                "description": "The server does not appear to implement rate limiting, making it vulnerable to brute force attacks.",
                "risk_level": "Medium",
                "details": {
                    "recommendation": "Implement rate limiting on login pages and sensitive APIs."
                }
            })
            medium_risks += 1
            summary_parts.append("No rate limiting was detected, potentially allowing brute force attacks.")
    
    # Build the final summary text
    summary_text = "\n".join(summary_parts)
    
    if not summary_text:
        summary_text = f"Scan completed for {domain}. No significant issues were detected in this scan."
    
    # Generate the risk summary based on findings
    total_findings = high_risks + medium_risks + low_risks
    
    # Add an overall risk assessment
    if high_risks > 0:
        risk_level = "High"
        summary_text = f"[HIGH RISK ASSESSMENT] {domain} has {high_risks} high-risk issues that require immediate attention.\n\n" + summary_text
    elif medium_risks > 0:
        risk_level = "Medium"
        summary_text = f"[MEDIUM RISK ASSESSMENT] {domain} has {medium_risks} medium-risk issues that should be addressed.\n\n" + summary_text
    else:
        risk_level = "Low"
        summary_text = f"[LOW RISK ASSESSMENT] {domain} appears to have good security practices with only minor issues detected.\n\n" + summary_text
    
    # Return the compiled summary
    return {
        "text": summary_text,
        "high_risks": high_risks,
        "medium_risks": medium_risks,
        "low_risks": low_risks,
        "total_findings": total_findings,
        "findings": findings,
        "risk_level": risk_level
    }
