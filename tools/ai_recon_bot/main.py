import asyncio
import json
import sys
import traceback
from datetime import datetime
from recon_engine import run_full_scan
from summarize import summarize_recon_output


# Custom JSON encoder that handles datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(DateTimeEncoder, self).default(obj)


async def main():
    try:
        # Check if a domain was provided as a command-line argument
        if len(sys.argv) > 1:
            target = sys.argv[1].strip()
            # Default to light scan mode if not specified
            mode = "light"
            
            # If a second argument is provided, use it as the mode
            if len(sys.argv) > 2:
                mode = sys.argv[2].strip().lower()
                # Validate mode to either "light" or "full"
                if mode not in ["light", "full"]:
                    mode = "light"
        else:
            # Fallback to interactive mode if no arguments provided
            target = input("Enter a domain or IP: ").strip()
            mode = input("Choose scan mode - 'light' or 'full': ").strip().lower()
            if mode not in ["light", "full"]:
                mode = "light"

        # For API integration, we'll output structured JSON
        is_api_mode = len(sys.argv) > 1

        if not is_api_mode:
            print(f"\nRunning {mode} recon on: {target}...\n")

        try:
            # Run the scan
            results = await run_full_scan(target, mode)
            
            # Add summary information to the results
            summary = summarize_recon_output(results)
            results["summary"] = summary
            
            if is_api_mode:
                # Ensure all sections are present in the results, even with empty/error data
                # This ensures frontend can display all sections
                expected_sections = [
                    "whois", "dns", "ssl", "http_headers", "open_ports", 
                    "cdn_waf", "ip_geolocation", "subdomains", "robots_sitemap", 
                    "directory_fingerprint", "rate_limit", "github_metadata"
                ]
                
                # Make sure all sections exist, even if empty or containing errors
                for section in expected_sections:
                    if section not in results:
                        results[section] = {"error": "No data collected"}
                    
                    # If a section is None or empty list/dict, replace with a structured error
                    if results[section] is None:
                        results[section] = {"error": "No data available"}
                    elif isinstance(results[section], dict) and not results[section]:
                        results[section] = {"error": "No data available"}
                    elif isinstance(results[section], list) and not results[section]:
                        results[section] = [{"error": "No data available"}]
                
                # Output JSON for API mode - use our custom encoder for datetime objects
                print(json.dumps(results, cls=DateTimeEncoder))
                return
            
            # Below is the original console output format for interactive mode
            print("\n=== Recon Results ===\n")

            # Loop over all sections except ones we want to print separately
            for section, data in results.items():
                if section in [
                    "subdomains",
                    "robots_sitemap",
                    "directory_fingerprint",
                    "rate_limit",
                    "github_metadata",
                    "summary"
                ]:
                    continue

                print(f"--- {section.upper()} ---")
                if isinstance(data, dict):
                    for key, value in data.items():
                        print(f"{key}: {value}")
                elif isinstance(data, list):
                    for item in data:
                        print(f"- {item}")
                else:
                    print(data)
                print()

            # Subdomains block
            print("\n--- SUBDOMAINS ---")
            sub = results.get("subdomains")
            if not sub:
                print("Subdomain data not available.")
            elif "error" in sub:
                print(f"Error: {sub['error']}")
            else:
                for s in sub.get("subdomains", []):
                    print(f"- {s}")

            # robots.txt + sitemap block
            print("\n--- ROBOTS & SITEMAP ---")
            robots = results.get("robots_sitemap", {})

            # Print robots.txt rules
            rules = robots.get("robots_rules", [])
            if rules:
                print("📄 Disallowed Paths from robots.txt:")
                for rule in rules:
                    print(f"  - {rule}")
            else:
                print("ℹ️ No robots.txt rules found or file not accessible.")

            # Print sitemap.xml links
            sitemaps = robots.get("sitemap_links", [])
            if sitemaps:
                print("\n🗺️ Sitemap References Found:")
                for site in sitemaps:
                    print(f"  - {site}")
            else:
                print("ℹ️ No sitemap.xml file found or sitemap links not listed.")

            # Print warnings
            warnings = robots.get("warnings", [])
            if warnings:
                print("\n⚠️ Potentially Sensitive Disallowed Paths:")
                for warn in warnings:
                    print(f"  - {warn}")
            else:
                print("\n✅ No suspicious disallow patterns found.")

            # Directory fingerprinting
            print("\n--- DIRECTORY FINGERPRINTING ---")
            dir_fingerprint = results.get("directory_fingerprint", [])
            if isinstance(dir_fingerprint, list) and dir_fingerprint:
                for entry in dir_fingerprint:
                    path = entry.get("path")
                    status = entry.get("status")
                    risk = entry.get("risk", "Unknown")
                    print(f"{path} → HTTP {status} → {risk}")
            elif isinstance(dir_fingerprint, dict) and "error" in dir_fingerprint:
                print(f"Error: {dir_fingerprint['error']}")
            else:
                print("No sensitive directories detected.")

            # Rate Limiting and CAPTCHA detection
            print("\n--- RATE LIMIT / CAPTCHA TEST ---")
            rl = results.get("rate_limit")
            if isinstance(rl, dict) and "error" in rl:
                print(f"Error: {rl['error']}")
            elif isinstance(rl, list) and rl:
                for entry in rl:
                    print(f"Path: {entry.get('path')}")
                    print(f"  Statuses: {entry.get('statuses')}")
                    print(f"  Avg response time: {entry.get('avg_response_time')}s")
                    print(f"  Rate Limiting Detected: {'✅' if entry.get('rate_limit_detected') else '❌'}")
                    print(f"  CAPTCHA Detected: {'✅' if entry.get('captcha_detected') else '❌'}")
            else:
                print("No rate limiting or CAPTCHA behavior detected.")

            # GitHub metadata check
            print("\n--- GITHUB METADATA ---")
            gh = results.get("github_metadata", {})
            if "error" in gh:
                print(f"Error: {gh['error']}")
            elif not gh.get("detected"):
                print("No GitHub presence detected.")
            else:
                for profile in gh.get("github_profiles", []):
                    print(f"🔗 Profile: {profile}")
                for policy in gh.get("security_policies", []):
                    print(f"🛡️ SECURITY.md found: {policy}")
                for note in gh.get("notes", []):
                    print(f"Note: {note}")

            # Final summary
            print("\n=== Summary ===\n")
            print(summary.get("text", ""))
        
        except Exception as e:
            # Handle errors during scan
            error_details = {
                "error": f"Scan error: {str(e)}",
                "traceback": traceback.format_exc()
            }
            
            if is_api_mode:
                # Return error as JSON
                print(json.dumps(error_details))
            else:
                # Print error details to console
                print(f"Error during scan: {e}")
                print(traceback.format_exc())

    except Exception as e:
        # Handle any other errors
        error_message = f"Unexpected error: {str(e)}"
        traceback_info = traceback.format_exc()
        
        # Try to output as JSON if in API mode
        if len(sys.argv) > 1:
            error_json = json.dumps({
                "error": error_message,
                "traceback": traceback_info
            })
            print(error_json)
        else:
            print(error_message)
            print(traceback_info)


if __name__ == "__main__":
    asyncio.run(main())


