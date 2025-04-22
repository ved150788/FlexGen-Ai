# AI Recon Bot

A cybersecurity reconnaissance tool that scans domains for surface-level security risks with automated risk tagging.

## Features

- WHOIS data analysis
- DNS records examination
- SSL certificate verification
- HTTP security headers check
- Open ports detection
- Subdomain enumeration
- Rate limiting assessment
- Directory exposure detection
- GitHub metadata analysis
- Automatic risk tagging (High, Medium, Low)

## Technical Stack

- Built with Python using asyncio for concurrency
- Uses aiohttp for HTTP requests
- Leverages whois, dnspython, and socket libraries for reconnaissance tasks
- Integrates Nmap for port scanning
- Uses public APIs like crt.sh and ip-api for subdomain and geolocation checks
- No external AI or cloud services - all risk tagging is rule-based and runs locally

## Usage (Command Line)

```bash
python main.py example.com
```

## Requirements

Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Integration with Web Interface

The tool is integrated with the FlexGen.ai website through a Next.js API route that executes the Python script and returns the results as JSON.

## Output Format

The tool returns a structured JSON object containing the scan results with risk levels assigned to each finding.

## Development Notes

- All scanning is performed with respect to legal and ethical boundaries
- The tool only performs passive reconnaissance and non-intrusive scanning
- Risk levels are determined by a rule-based system defined in `recon_engine.py`

## Legal Disclaimer

This tool should only be used on domains you own or have explicit permission to scan. Using this tool against unauthorized targets may violate laws and regulations.

## Status

This tool is currently in beta. Feedback and bug reports are welcome!
