"""
Tests for specification loading functionality
"""

import json
import os
import unittest
from pathlib import Path
import tempfile

from ..fuzzer import OpenAPIFuzzer, GraphQLFuzzer

# Create test fixture files
SAMPLE_OPENAPI_JSON = {
    "openapi": "3.0.0",
    "info": {
        "title": "Test API",
        "version": "1.0.0"
    },
    "paths": {
        "/test": {
            "get": {
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            }
        }
    }
}

SAMPLE_GRAPHQL_SCHEMA = """
type Query {
  hello: String
  user(id: ID!): User
}

type User {
  id: ID!
  name: String!
  email: String
}
"""

class TestSpecLoading(unittest.TestCase):
    """Test specification loading functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create temporary directory for test files
        self.temp_dir = tempfile.TemporaryDirectory()
        
        # Create sample OpenAPI JSON spec
        self.openapi_json_path = os.path.join(self.temp_dir.name, "test_openapi.json")
        with open(self.openapi_json_path, "w") as f:
            json.dump(SAMPLE_OPENAPI_JSON, f)
        
        # Create sample GraphQL schema
        self.graphql_path = os.path.join(self.temp_dir.name, "test_schema.graphql")
        with open(self.graphql_path, "w") as f:
            f.write(SAMPLE_GRAPHQL_SCHEMA)
        
        # Base URL for tests
        self.base_url = "http://localhost:8000"
    
    def tearDown(self):
        """Clean up test fixtures"""
        self.temp_dir.cleanup()
    
    def test_openapi_json_loading(self):
        """Test loading an OpenAPI JSON specification"""
        fuzzer = OpenAPIFuzzer(
            spec_path=self.openapi_json_path,
            base_url=self.base_url,
            use_schemathesis=False
        )
        
        # Check that the spec was loaded correctly
        self.assertEqual(fuzzer.spec["openapi"], "3.0.0")
        self.assertEqual(fuzzer.spec["info"]["title"], "Test API")
        
        # Check that endpoints were extracted
        endpoints = fuzzer._get_endpoints()
        self.assertEqual(len(endpoints), 1)
        self.assertEqual(endpoints[0]["path"], "/test")
        self.assertEqual(endpoints[0]["method"], "GET")
    
    def test_graphql_loading(self):
        """Test loading a GraphQL schema"""
        fuzzer = GraphQLFuzzer(
            schema_path=self.graphql_path,
            base_url=self.base_url
        )
        
        # Check that the schema was loaded correctly
        self.assertIsNotNone(fuzzer.schema)
        
        # Check that queries were extracted
        operations = fuzzer._get_queries_and_mutations()
        self.assertEqual(len(operations["queries"]), 2)
        
        # Verify query names
        query_names = [q["name"] for q in operations["queries"]]
        self.assertIn("hello", query_names)
        self.assertIn("user", query_names)
        
        # Verify that there are no mutations
        self.assertEqual(len(operations["mutations"]), 0)

if __name__ == "__main__":
    unittest.main() 