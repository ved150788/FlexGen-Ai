def summarize_recon_output(results):
    # Keep the original summary text for compatibility
    summary_lines = []
    
    # New structured findings list for the web UI
    findings = []
    
    # WHOIS Summary
    whois = results.get("whois", {})
    if "error" in whois:
        summary_lines.append("WHOIS lookup failed.")
    else:
        registrar = whois.get("registrar", "Unknown Registrar")
        creation_date = whois.get("creation_date", "N/A")
        expiry_date = whois.get("expiration_date", "N/A")
        summary_text = f"Domain registered with {registrar}. Created on: {creation_date}, Expires on: {expiry_date}."
        summary_lines.append(summary_text)
        findings.append({
            "name": "WHOIS Information",
            "description": summary_text,
            "risk_level": "Low",
            "details": whois
        })

    # DNS Summary
    dns = results.get("dns", {})
    if "error" in dns:
        summary_lines.append("DNS record lookup failed.")
        findings.append({
            "name": "DNS Lookup Error",
            "description": "DNS record lookup failed.",
            "risk_level": "Medium",
            "details": {"error": dns.get("error")}
        })
    else:
        dns_details = {}
        if dns.get("A"):
            summary_lines.append(f"A record points to: {', '.join(dns['A'])}")
            dns_details["A"] = dns["A"]
        if dns.get("MX"):
            summary_lines.append(f"Mail servers (MX): {', '.join(dns['MX'])}")
            dns_details["MX"] = dns["MX"]
        if dns.get("TXT"):
            summary_lines.append(f"TXT records found: {len(dns['TXT'])}")
            dns_details["TXT"] = dns["TXT"]
            
            # Check for SPF and DMARC records
            spf_found = any("v=spf1" in txt.lower() for txt in dns["TXT"])
            dmarc_found = any("v=dmarc1" in txt.lower() for txt in dns["TXT"])
            
            if not spf_found:
                findings.append({
                    "name": "Missing SPF Record",
                    "description": "No SPF record found in DNS TXT records.",
                    "risk_level": "Medium",
                    "details": {"recommendation": "Implement SPF record to prevent email spoofing"}
                })
            
            if not dmarc_found:
                findings.append({
                    "name": "Missing DMARC Record",
                    "description": "No DMARC record found in DNS TXT records.",
                    "risk_level": "Medium",
                    "details": {"recommendation": "Implement DMARC record to enhance email security"}
                })
            
        if dns.get("NS"):
            summary_lines.append(f"Name servers: {', '.join(dns['NS'])}")
            dns_details["NS"] = dns["NS"]
        if any(dns.get(r) for r in ["A", "MX", "TXT", "NS"]):
            findings.append({
                "name": "DNS Configuration",
                "description": "DNS records found",
                "risk_level": "Low",
                "details": dns_details
            })
        else:
            summary_lines.append("No DNS records found.")
            findings.append({
                "name": "Missing DNS Records",
                "description": "No standard DNS records found.",
                "risk_level": "High",
                "details": {"recommendation": "Configure proper DNS records"}
            })

    # Risk from open ports
    for entry in results.get("open_ports", {}).get("services", []):
        port = entry.get("port", "")
        risk_text = entry.get("risk", "")
        
        if "SSH" in risk_text or "Telnet" in risk_text:
            risk_level = "High"
            summary_lines.append(f"[HIGH] {port} → {risk_text}")
        elif "HTTP" in risk_text:
            risk_level = "Medium"
            summary_lines.append(f"[MEDIUM] {port} → {risk_text}")
        else:
            risk_level = "Low"
            summary_lines.append(f"[LOW] {port} → {risk_text}")
            
        findings.append({
            "name": f"Open Port {port}",
            "description": risk_text,
            "risk_level": risk_level,
            "details": entry
        })

    # robots.txt sensitive paths
    for rule in results.get("robots_sitemap", {}).get("warnings", []):
        summary_lines.append(f"[MEDIUM] Suspicious robots.txt entry: {rule}")
        findings.append({
            "name": "Sensitive robots.txt Entry",
            "description": f"Potentially sensitive path found in robots.txt: {rule}",
            "risk_level": "Medium",
            "details": {"path": rule}
        })

    # Subdomain risk
    for sub in results.get("subdomains", {}).get("subdomains", []):
        description = f"Found subdomain: {sub}"
        if any(x in sub for x in ["admin", "test", "dev", "staging"]):
            summary_lines.append(f"[MEDIUM] {description}")
            findings.append({
                "name": "Sensitive Subdomain",
                "description": description,
                "risk_level": "Medium",
                "details": {"subdomain": sub}
            })
        else:
            findings.append({
                "name": "Subdomain",
                "description": description,
                "risk_level": "Low",
                "details": {"subdomain": sub}
            })

    # Directory exposure
    for entry in results.get("directory_fingerprint", []):
        risk = entry.get("risk", "")
        path = entry.get("path", "")
        description = f"Directory: {path} → {risk}"
        
        if "❗" in risk:
            summary_lines.append(f"[HIGH] {description}")
            findings.append({
                "name": "Critical Directory Exposure",
                "description": description,
                "risk_level": "High",
                "details": entry
            })
        elif "⚠️" in risk:
            summary_lines.append(f"[MEDIUM] {description}")
            findings.append({
                "name": "Sensitive Directory Exposure",
                "description": description,
                "risk_level": "Medium",
                "details": entry
            })

    # CAPTCHA / Rate Limiting
    rl = results.get("rate_limit", [])
    if isinstance(rl, list):
        for entry in rl:
            if isinstance(entry, dict):
                path = entry.get('path', 'unknown')
                if not entry.get("rate_limit_detected"):
                    description = f"No rate limiting on {path}"
                    summary_lines.append(f"[MEDIUM] {description}")
                    findings.append({
                        "name": "Missing Rate Limiting",
                        "description": description,
                        "risk_level": "Medium",
                        "details": entry
                    })
                if not entry.get("captcha_detected"):
                    description = f"No CAPTCHA on {path}"
                    summary_lines.append(f"[LOW] {description}")
                    findings.append({
                        "name": "Missing CAPTCHA",
                        "description": description,
                        "risk_level": "Low",
                        "details": entry
                    })
    elif isinstance(rl, dict) and "error" in rl:
        description = f"Rate limiting check failed: {rl['error']}"
        summary_lines.append(f"[LOW] {description}")
        findings.append({
            "name": "Rate Limiting Check Error",
            "description": description,
            "risk_level": "Low",
            "details": rl
        })
    else:
        description = "No rate limiting or CAPTCHA info returned."
        summary_lines.append(f"[LOW] {description}")
        findings.append({
            "name": "Rate Limiting Information",
            "description": description,
            "risk_level": "Low",
            "details": {}
        })

    # HTTP Headers
    missing_headers = results.get("http_headers", {}).get("missing_security_headers", [])
    for header in missing_headers:
        if "csp" in header.lower():
            description = "Missing Content-Security-Policy"
            summary_lines.append(f"[LOW] {description}")
            findings.append({
                "name": "Missing CSP Header",
                "description": description,
                "risk_level": "Medium",
                "details": {"header": header}
            })
        elif "hsts" in header.lower():
            description = "Missing HSTS (Strict-Transport-Security)"
            summary_lines.append(f"[LOW] {description}")
            findings.append({
                "name": "Missing HSTS Header",
                "description": description,
                "risk_level": "Medium",
                "details": {"header": header}
            })
        else:
            description = f"Missing header: {header}"
            summary_lines.append(f"[LOW] {description}")
            findings.append({
                "name": "Missing Security Header",
                "description": description,
                "risk_level": "Low",
                "details": {"header": header}
            })

    # GitHub metadata
    github = results.get("github_metadata", {})
    if github.get("security_policies"):
        for policy in github["security_policies"]:
            description = f"SECURITY.md found: {policy}"
            summary_lines.append(f"[INFO] {description}")
            findings.append({
                "name": "Security Policy",
                "description": description,
                "risk_level": "Low",
                "details": {"policy_url": policy}
            })
    if not github.get("detected"):
        description = "No GitHub org/user found matching domain."
        summary_lines.append(f"[LOW] {description}")
        findings.append({
            "name": "No GitHub Presence",
            "description": description,
            "risk_level": "Low",
            "details": {}
        })

    # Count findings by risk level
    high_risks = sum(1 for finding in findings if finding["risk_level"] == "High")
    medium_risks = sum(1 for finding in findings if finding["risk_level"] == "Medium")
    low_risks = sum(1 for finding in findings if finding["risk_level"] == "Low")
    
    # Create the return object
    return {
        "text": "\n".join(summary_lines),
        "findings": findings,
        "high_risks": high_risks,
        "medium_risks": medium_risks,
        "low_risks": low_risks,
        "total_findings": len(findings)
    }
