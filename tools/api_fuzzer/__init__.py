"""
API Fuzzer - A tool for testing API endpoints based on OpenAPI and GraphQL specifications
"""

from .fuzzer import OpenAPIFuzzer, GraphQLFuzzer
from .report import FuzzingReport, Issue
from .utils import setup_logger

__version__ = "0.1.0" 