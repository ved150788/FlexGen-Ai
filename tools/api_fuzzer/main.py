#!/usr/bin/env python3
"""
API Fuzzer Tool - Main Entry Point
A tool for testing API endpoints based on OpenAPI and GraphQL specifications
"""

import argparse
import json
import logging
import os
import sys
import time
import yaml
from pathlib import Path
from typing import Dict, Any, Optional, Union
from urllib.parse import urlparse

from .fuzzer import OpenAPIFuzzer, GraphQLFuzzer
from .report import FuzzingReport, setup_logger

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="API Fuzzer - Test API endpoints for vulnerabilities",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    # Required parameters
    parser.add_argument("--spec", "-s", required=True, 
                        help="Path to API specification file (OpenAPI/GraphQL) or URL")
    
    # Optional parameters with defaults
    parser.add_argument("--base-url", "-u", help="Base URL of the API to test")
    parser.add_argument("--headers", "-H", help="HTTP headers in JSON format", default="{}")
    parser.add_argument("--auth", "-a", help="Authentication token or credentials")
    parser.add_argument("--output", "-o", help="Output file for the report", default="fuzzing_report.json")
    parser.add_argument("--max-requests", "-m", type=int, default=50, 
                        help="Maximum number of requests per endpoint")
    parser.add_argument("--rate", "-r", type=float, default=5, 
                        help="Maximum requests per second")
    parser.add_argument("--timeout", "-t", type=float, default=5, 
                        help="Request timeout in seconds")
    parser.add_argument("--concurrency", "-c", type=int, default=3, 
                        help="Number of concurrent requests")
    parser.add_argument("--config", help="Path to configuration file (JSON or YAML)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--no-schemathesis", action="store_true", 
                        help="Disable Schemathesis integration (OpenAPI only)")
    
    return parser.parse_args()

def load_config_file(config_path: str) -> Dict[str, Any]:
    """Load configuration from a JSON or YAML file"""
    path = Path(config_path)
    
    if not path.exists():
        logging.error(f"Configuration file does not exist: {config_path}")
        sys.exit(1)
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if path.suffix.lower() in [".yaml", ".yml"]:
            return yaml.safe_load(content)
        else:
            return json.loads(content)
    
    except Exception as e:
        logging.error(f"Failed to load configuration file: {str(e)}")
        sys.exit(1)

def merge_config(cli_args, config_file: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Merge CLI arguments with configuration file"""
    config = vars(cli_args).copy()
    
    if config_file:
        # Config file values are overridden by CLI arguments
        for key, value in config_file.items():
            if key in config and config[key] is None:
                config[key] = value
    
    return config

def is_url(s: str) -> bool:
    """Check if a string is a URL"""
    try:
        result = urlparse(s)
        return all([result.scheme, result.netloc])
    except:
        return False

def download_spec(url: str) -> str:
    """Download a specification file from a URL"""
    import requests
    import tempfile
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Create a temporary file
        suffix = ".json" if "json" in response.headers.get("content-type", "") else ".yaml"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(response.content)
            temp_path = f.name
        
        return temp_path
    
    except Exception as e:
        logging.error(f"Failed to download specification from URL: {str(e)}")
        sys.exit(1)

def main():
    """Main entry point for the API Fuzzer tool"""
    args = parse_arguments()
    
    # Set up logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    setup_logger(log_level)
    logger = logging.getLogger("api_fuzzer")
    
    # Load config file if specified
    config_file = None
    if args.config:
        config_file = load_config_file(args.config)
    
    # Merge config
    config = merge_config(args, config_file)
    
    logger.info("Starting API Fuzzer")
    
    # Check if spec is a URL
    spec_path = config["spec"]
    if is_url(spec_path):
        logger.info(f"Downloading specification from URL: {spec_path}")
        spec_path = download_spec(spec_path)
        logger.info(f"Specification downloaded to: {spec_path}")
    
    if not Path(spec_path).exists():
        logger.error(f"Specification file does not exist: {spec_path}")
        sys.exit(1)
    
    # Required base_url
    if not config.get("base_url"):
        logger.error("Base URL is required. Specify with --base-url")
        sys.exit(1)
    
    start_time = time.time()
    
    # Determine the type of specification
    spec_path_obj = Path(spec_path)
    
    try:
        if spec_path_obj.suffix.lower() in ['.json', '.yaml', '.yml']:
            # OpenAPI spec
            logger.info("Detected OpenAPI specification")
            fuzzer = OpenAPIFuzzer(
                spec_path=spec_path,
                base_url=config["base_url"],
                headers=config["headers"],
                auth_token=config.get("auth"),
                max_requests_per_endpoint=config["max_requests"],
                rate_limit=config["rate"],
                timeout=config["timeout"],
                concurrent_requests=config["concurrency"],
                use_schemathesis=not config.get("no_schemathesis", False)
            )
        elif spec_path_obj.suffix.lower() in ['.graphql', '.gql']:
            # GraphQL spec
            logger.info("Detected GraphQL specification")
            fuzzer = GraphQLFuzzer(
                schema_path=spec_path,
                base_url=config["base_url"],
                headers=config["headers"],
                auth_token=config.get("auth"),
                max_requests_per_query=config["max_requests"],
                rate_limit=config["rate"],
                timeout=config["timeout"],
                concurrent_requests=config["concurrency"]
            )
        else:
            logger.error(f"Unsupported specification file type: {spec_path_obj.suffix}")
            sys.exit(1)
        
        # Run the fuzzing process
        logger.info(f"Starting fuzzing with the following parameters:")
        logger.info(f"  Maximum Requests: {config['max_requests']} per endpoint")
        logger.info(f"  Rate Limit: {config['rate']} requests/second")
        logger.info(f"  Timeout: {config['timeout']} seconds")
        logger.info(f"  Concurrency: {config['concurrency']} workers")
        
        report = fuzzer.run()
        
        # Generate report
        report.save(config["output"])
        
        elapsed_time = time.time() - start_time
        logger.info(f"Fuzzing completed in {elapsed_time:.2f} seconds")
        logger.info(f"Total issues found: {len(report.issues)}")
        
        # Print a summary of issues found
        if report.issues:
            logger.info("Summary of issues found:")
            for i, issue in enumerate(report.issues, 1):
                logger.info(f"{i}. {issue.title} ({issue.severity}): {issue.endpoint}")
        else:
            logger.info("No issues found during fuzzing")
        
        # Clean up downloaded spec if it was a URL
        if is_url(config["spec"]) and os.path.exists(spec_path):
            os.unlink(spec_path)
            logger.debug(f"Removed temporary specification file: {spec_path}")
    
    except KeyboardInterrupt:
        logger.info("Fuzzing interrupted by user")
        sys.exit(1)
    
    except Exception as e:
        logger.error(f"Error during fuzzing: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 