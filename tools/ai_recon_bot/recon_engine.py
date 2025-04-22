import whois  
import dns.resolver
import ssl
import socket
import aiohttp
import subprocess
from datetime import datetime
import time
import asyncio


async def get_whois_info(domain):
    try:
        info = whois.whois(domain)
        return dict(info)
    except Exception as e:
        return {"error": f"WHOIS lookup failed: {str(e)}"}

async def get_dns_records(domain):
    records = {}
    try:
        for qtype in ['A', 'AAAA', 'MX', 'NS', 'TXT']:
            try:
                answers = dns.resolver.resolve(domain, qtype, raise_on_no_answer=False)
                records[qtype] = [r.to_text() for r in answers]
            except Exception:
                records[qtype] = []
    except Exception as e:
        records["error"] = f"DNS resolution failed: {str(e)}"
    return records
async def get_ssl_certificate_info(domain):
    context = ssl.create_default_context()

    try:
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

                # Extract important details
                subject = dict(x[0] for x in cert['subject'])
                issuer = dict(x[0] for x in cert['issuer'])
                issued_to = subject.get('commonName', 'Unknown')
                issued_by = issuer.get('commonName', 'Unknown')

                valid_from = cert.get('notBefore')
                valid_to = cert.get('notAfter')

                # Check validity
                valid_to_date = datetime.strptime(valid_to, '%b %d %H:%M:%S %Y %Z')
                days_left = (valid_to_date - datetime.utcnow()).days
                expired = days_left < 0

                return {
                    "issued_to": issued_to,
                    "issued_by": issued_by,
                    "valid_from": valid_from,
                    "valid_to": valid_to,
                    "days_until_expiry": days_left,
                    "expired": expired
                }

    except Exception as e:
        return {"error": f"SSL certificate fetch failed: {str(e)}"}




async def get_http_headers(domain):
    headers_data = {}
    url = f"https://{domain}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10, allow_redirects=True) as response:
                headers = dict(response.headers)
                headers_data["headers"] = headers

                # Check for missing security headers
                required_headers = [
                    "Strict-Transport-Security",
                    "Content-Security-Policy",
                    "X-Frame-Options",
                    "X-Content-Type-Options",
                    "Referrer-Policy",
                    "Permissions-Policy"
                ]

                missing = [h for h in required_headers if h not in headers]
                headers_data["missing_security_headers"] = missing

    except Exception as e:
        headers_data["error"] = f"HTTP header scan failed: {str(e)}"

    return headers_data

import subprocess

def scan_ports_with_nmap(domain_or_ip, mode="full"):
    try:
        nmap_path = r"C:\Program Files (x86)\Nmap\nmap.exe"

        if mode == "full":
            cmd = [nmap_path, "-Pn", "-sS", "-sV", "--top-ports", "100", domain_or_ip]
            timeout = 120
        else:
            # fallback: not used in light mode for now
            cmd = [nmap_path, "-Pn", "-sT", "--top-ports", "20", domain_or_ip]
            timeout = 30

        result = subprocess.run(
            cmd,
            capture_output=True, text=True, timeout=timeout
        )

        if result.returncode != 0:
            return {"error": "Nmap scan failed or access denied."}

        # Parse the output as before...
        lines = result.stdout.splitlines()
        services = []
        parsing = False

        for line in lines:
            if line.strip().startswith("PORT"):
                parsing = True
                continue
            if parsing:
                if not line.strip() or line.strip().startswith("Nmap done") or line.strip()[0].isalpha():
                    continue  # skip footer, errors, or junk lines

                parts = line.split()
                if len(parts) >= 3 and "/" in parts[0]:
                    try:
                        port_number = int(parts[0].split("/")[0])
                        port_info = {
                            "port": parts[0],
                            "state": parts[1],
                            "service": parts[2],
                            "details": " ".join(parts[3:]) if len(parts) > 3 else "",
                            "risk": port_risk_map(port_number)
                        }
                        services.append(port_info)
                    except ValueError:
                        continue  # skip if port is not an integer

        return {"services": services}

    except Exception as e:
        return {"error": f"Nmap execution error: {str(e)}"}

def port_risk_map(port):
    risk_notes = {
        21: "FTP - Often insecure",
        22: "SSH - Brute force risk",
        23: "Telnet - Highly insecure",
        80: "HTTP - No encryption",
        3389: "RDP - High brute force risk",
        3306: "MySQL - Exposed DB",
        5432: "PostgreSQL - Exposed DB"
    }
    return risk_notes.get(port, "Standard or unknown risk")


# CDN

async def detect_cdn_or_waf(domain):
    result = {
        "cdn_or_waf": [],
        "dns_hint": None,
        "header_hint": [],
        "server_hint": None
    }

    # Step 1: DNS-based fingerprinting
    try:
        ns_records = dns.resolver.resolve(domain, "NS")
        ns_hosts = [r.to_text().lower() for r in ns_records]
        result["dns_hint"] = ns_hosts

        known_cdns = {
            "cloudflare": "cloudflare.com",
            "akamai": "akam.net",
            "sucuri": "sucuridns.com",
            "incapsula": "incapdns.net",
            "fastly": "fastly.net",
            "stackpath": "stackpathdns.com"
        }

        for name, signature in known_cdns.items():
            if any(signature in ns for ns in ns_hosts):
                result["cdn_or_waf"].append(name.upper())

    except Exception as e:
        result["dns_hint"] = f"DNS NS lookup failed: {str(e)}"

    # Step 2: Header-based detection
    try:
        url = f"https://{domain}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10) as response:
                headers = {k.lower(): v.lower() for k, v in response.headers.items()}

                # Look for CDN/WAF related headers
                header_keys = list(headers.keys())
                waf_signatures = {
                    "cf-ray": "CLOUDFLARE",
                    "x-sucuri-id": "SUCURI",
                    "x-cdn": "GENERIC_CDN",
                    "x-akamai": "AKAMAI",
                    "x-incapsula": "INCAPSULA"
                }

                for key, name in waf_signatures.items():
                    if key in headers:
                        result["cdn_or_waf"].append(name)
                        result["header_hint"].append(f"{key}: {headers[key]}")

                if "server" in headers:
                    result["server_hint"] = headers["server"]

    except Exception as e:
        result["header_hint"].append(f"HTTP request failed: {str(e)}")

    # Final deduplication
    result["cdn_or_waf"] = list(set(result["cdn_or_waf"]))
    return result


# geolocation: 

async def get_ip_geolocation(domain_or_ip):
    result = {}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://ip-api.com/json/{domain_or_ip}") as response:
                data = await response.json()
                if data["status"] == "success":
                    result = {
                        "ip": data.get("query"),
                        "country": data.get("country"),
                        "region": data.get("regionName"),
                        "city": data.get("city"),
                        "isp": data.get("isp"),
                        "org": data.get("org"),
                        "asn": data.get("as"),
                        "timezone": data.get("timezone"),
                        "lat": data.get("lat"),
                        "lon": data.get("lon")
                    }
                else:
                    result["error"] = data.get("message", "Unknown error from IP-API")
    except Exception as e:
        result["error"] = f"IP geolocation lookup failed: {str(e)}"

    return result

# get sub domain
async def get_subdomains(domain):
    url = f"https://crt.sh/?q=%25.{domain}&output=json"
    subdomains = set()

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=10) as response:
                if response.status != 200:
                    return {"error": f"crt.sh returned status {response.status}"}

                try:
                    data = await response.json(content_type=None)
                except Exception as e:
                    return {"error": f"JSON parsing failed: {str(e)}"}

                for entry in data:
                    name = entry.get("name_value")
                    if name:
                        # name_value can contain multiple domains split by \n
                        for sub in name.split("\n"):
                            if sub.endswith(domain):
                                subdomains.add(sub.strip())

        return {"subdomains": sorted(subdomains)}

    except Exception as e:
        return {"error": f"Subdomain lookup failed: {str(e)}"}

# sitemap

async def check_robots_and_sitemap(domain):
    result = {
        "robots_url": f"https://{domain}/robots.txt",
        "sitemap_url": f"https://{domain}/sitemap.xml",
        "robots_rules": [],
        "sitemap_links": [],
        "warnings": []
    }

    sensitive_keywords = ["admin", "test", "private", "backup", "staging", "tmp", "dev"]

    # Check robots.txt
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(result["robots_url"], timeout=10) as response:
                if response.status == 200:
                    content = await response.text()
                    lines = content.splitlines()
                    for line in lines:
                        line = line.strip()
                        if line.lower().startswith("disallow"):
                            result["robots_rules"].append(line)
                            # Check for suspicious disallowed paths
                            for keyword in sensitive_keywords:
                                if f"/{keyword}" in line.lower():
                                    result["warnings"].append(f"Suspicious path in robots.txt: {line}")
                        elif line.lower().startswith("sitemap:"):
                            result["sitemap_links"].append(line.split(":", 1)[1].strip())
                else:
                    result["robots_rules"].append(f"robots.txt not found (HTTP {response.status})")

    except Exception as e:
        result["robots_rules"].append(f"Failed to fetch robots.txt: {str(e)}")

    # Check sitemap.xml
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(result["sitemap_url"], timeout=10) as response:
                if response.status == 200:
                    xml = await response.text()
                    if "<urlset" in xml or "<sitemapindex" in xml:
                        result["sitemap_links"].append(result["sitemap_url"])
                else:
                    result["sitemap_links"].append(f"sitemap.xml not found (HTTP {response.status})")
    except Exception as e:
        result["sitemap_links"].append(f"Failed to fetch sitemap.xml: {str(e)}")

    return result


# Directory fingerprint 

async def fingerprint_common_directories(domain):
    base_url = f"https://{domain}".rstrip("/")
    common_paths = [
        "/.git/", "/admin/", "/backup/", "/phpinfo.php",
        "/test/", "/staging/", "/.env", "/config/", "/old/"
    ]

    results = []
    try:
        async with aiohttp.ClientSession() as session:
            tasks = []
            for path in common_paths:
                url = base_url + path
                tasks.append(fetch_head(session, url))

            responses = await asyncio.gather(*tasks)

            for path, status in zip(common_paths, responses):
                if status not in [404, None]:
                    results.append({
                        "path": path,
                        "status": status,
                        "risk": assess_risk(path, status)
                    })

    except Exception as e:
        results.append({"error": f"Directory scan failed: {str(e)}"})

    return results


async def fetch_head(session, url):
    try:
        async with session.head(url, timeout=10, allow_redirects=True) as resp:
            return resp.status
    except Exception:
        return None

# Ratelimiting

async def check_rate_limiting_and_captcha(domain):
    test_paths = ["/", "/login", "/admin"]
    base_url = f"https://{domain}".rstrip("/")
    results = []

    try:
        async with aiohttp.ClientSession() as session:
            for path in test_paths:
                url = base_url + path
                rate_check = await simulate_rate_limit_check(session, url)
                results.append({
                    "path": path,
                    **rate_check
                })

    except Exception as e:
        return {"error": f"Rate limiting check failed: {str(e)}"}

    return results


async def simulate_rate_limit_check(session, url, attempts=5):
    statuses = []
    delays = []
    has_captcha = False

    for _ in range(attempts):
        start = time.perf_counter()
        try:
            async with session.get(url, timeout=10) as resp:
                elapsed = round(time.perf_counter() - start, 2)
                statuses.append(resp.status)
                delays.append(elapsed)

                body = await resp.text()
                if any(kw in body.lower() for kw in ["captcha", "i am not a robot", "recaptcha"]):
                    has_captcha = True

        except Exception:
            statuses.append("error")
            delays.append(-1)

        await asyncio.sleep(0.5)  # short pause between attempts

    status_set = set(statuses)
    triggered_rate_limit = 429 in statuses or statuses.count(403) >= 3

    return {
        "statuses": statuses,
        "avg_response_time": round(sum(delays) / len(delays), 2),
        "rate_limit_detected": triggered_rate_limit,
        "captcha_detected": has_captcha
    }

def assess_risk(path, status):
    if path == "/.git/":
        return "❗ .git folder exposed – can leak source code"
    elif path == "/phpinfo.php":
        return "❗ PHP Info exposed – gives server config"
    elif "backup" in path or "old" in path:
        return "⚠️ Might expose archived data"
    elif status == 403:
        return "⚠️ Forbidden – might still be accessible indirectly"
    elif status == 200:
        return "⚠️ Accessible – should be reviewed"
    return "ℹ️ Unusual response"

# github
async def check_github_metadata(domain):
    result = {
        "detected": False,
        "repos_checked": [],
        "security_policies": [],
        "github_profiles": [],
        "notes": []
    }

    try:
        possible_names = set()
        clean_name = domain.lower().replace("www.", "").split(".")[0]
        possible_names.update([clean_name, domain.lower()])

        async with aiohttp.ClientSession(headers={"Accept": "application/vnd.github.v3+json"}) as session:
            for name in possible_names:
                url = f"https://api.github.com/users/{name}"
                async with session.get(url) as user_resp:
                    if user_resp.status == 200:
                        result["github_profiles"].append(f"https://github.com/{name}")
                        result["detected"] = True

                        # Get user repos
                        async with session.get(f"https://api.github.com/users/{name}/repos") as repos_resp:
                            if repos_resp.status == 200:
                                repos = await repos_resp.json()
                                for repo in repos:
                                    repo_name = repo.get("name", "")
                                    full_name = repo.get("full_name", "")
                                    result["repos_checked"].append(full_name)

                                    # Check for SECURITY.md
                                    sec_url = f"https://raw.githubusercontent.com/{full_name}/main/SECURITY.md"
                                    async with session.get(sec_url) as sec_resp:
                                        if sec_resp.status == 200:
                                            result["security_policies"].append(sec_url)
                                            result["notes"].append(f"SECURITY.md found in {full_name}")

            if not result["github_profiles"]:
                result["notes"].append("No GitHub user/org directly matched domain name.")

    except Exception as e:
        return {"error": f"GitHub metadata lookup failed: {str(e)}"}

    return result
#fullscan
async def run_full_scan(target, mode="light"):
    whois_data = await get_whois_info(target)
    dns_data = await get_dns_records(target)
    ssl_data = await get_ssl_certificate_info(target)
    headers_data = await get_http_headers(target)
    cdn_waf_data = await detect_cdn_or_waf(target)
    geo_data = await get_ip_geolocation(target)
    subdomain_data = await get_subdomains(target)
    robots_data = await check_robots_and_sitemap(target)
    directory_data = await fingerprint_common_directories(target)
    rate_limit_data = await check_rate_limiting_and_captcha(target)
    github_data = await check_github_metadata(target)








    if mode == "full":
        print("Running Nmap scan... this may take a while.\n")
        nmap_data = scan_ports_with_nmap(target, mode="full")
    else:
        print("Skipping Nmap for lightweight scan.\n")
        nmap_data = {"note": "Nmap scan skipped in light mode"}

    return {
        "whois": whois_data,
        "dns": dns_data,
        "ssl": ssl_data,
        "http_headers": headers_data,
        "open_ports": nmap_data,
        "cdn_waf": cdn_waf_data,
        "ip_geolocation": geo_data,
        "subdomains": subdomain_data,
        "robots_sitemap": robots_data,
        "directory_fingerprint": directory_data,
        "rate_limit": rate_limit_data,
        "github_metadata": github_data



    }
