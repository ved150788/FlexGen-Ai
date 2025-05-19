"""
API Fuzzer implementations for OpenAPI and GraphQL
"""

import asyncio
import json
import logging
import random
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union, Set
import tempfile
import os

import aiohttp
import yaml
from jsonschema import validate
from openapi_spec_validator import validate_spec
from tqdm import tqdm
import schemathesis
from graphql import parse, build_ast_schema, GraphQLSchema, GraphQLObjectType, GraphQLField, GraphQLScalarType
from graphql.language import parse as graphql_parse

from .report import FuzzingReport, Issue, IssueSeverity
from .utils import (
    calculate_sleep_time,
    generate_fuzzed_value,
    parse_headers,
    get_attack_string,
)

logger = logging.getLogger("api_fuzzer")

class BaseFuzzer:
    """Base class for API fuzzers"""
    
    def __init__(
        self,
        base_url: str,
        headers: Optional[Union[Dict[str, str], str]] = None,
        auth_token: Optional[str] = None,
        rate_limit: float = 10.0,
        timeout: float = 10.0,
        concurrent_requests: int = 5
    ):
        self.base_url = base_url.rstrip("/")
        self.headers = parse_headers(headers or {})
        
        # Add authentication if provided
        if auth_token:
            if auth_token.startswith("Bearer "):
                self.headers["Authorization"] = auth_token
            else:
                self.headers["Authorization"] = f"Bearer {auth_token}"
        
        self.rate_limit = rate_limit
        self.timeout = timeout
        self.concurrent_requests = concurrent_requests
        self.last_request_time = 0.0
        self.report = FuzzingReport()
    
    async def send_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[float] = None
    ) -> Tuple[int, Dict[str, Any], float]:
        """Send a request to the API and return the response"""
        # Respect rate limiting
        sleep_time = calculate_sleep_time(self.rate_limit, self.last_request_time)
        if sleep_time > 0:
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
        full_url = f"{self.base_url}{endpoint}"
        
        # Combine headers
        request_headers = self.headers.copy()
        if headers:
            request_headers.update(headers)
        
        timeout_obj = aiohttp.ClientTimeout(total=timeout or self.timeout)
        
        start_time = time.time()
        try:
            async with aiohttp.ClientSession(timeout=timeout_obj) as session:
                request_kwargs = {
                    "headers": request_headers,
                    "ssl": False  # Disable SSL verification for testing
                }
                
                if params:
                    request_kwargs["params"] = params
                
                if data:
                    if method in ["POST", "PUT", "PATCH"]:
                        request_kwargs["json"] = data
                
                async with session.request(method, full_url, **request_kwargs) as response:
                    try:
                        response_json = await response.json()
                    except:
                        response_json = {}
                    
                    response_time = time.time() - start_time
                    return response.status, response_json, response_time
        
        except asyncio.TimeoutError:
            logger.warning(f"Request timeout: {method} {endpoint}")
            response_time = time.time() - start_time
            return 0, {"error": "timeout"}, response_time
        
        except Exception as e:
            logger.error(f"Request error: {method} {endpoint} - {str(e)}")
            response_time = time.time() - start_time
            return 0, {"error": str(e)}, response_time
    
    def run(self) -> FuzzingReport:
        """Run the fuzzing process and return the report"""
        raise NotImplementedError("Subclasses must implement run()")


class OpenAPIFuzzer(BaseFuzzer):
    """Fuzzer for OpenAPI specifications"""
    
    def __init__(
        self,
        spec_path: Union[str, Path],
        base_url: str,
        headers: Optional[Union[Dict[str, str], str]] = None,
        auth_token: Optional[str] = None,
        max_requests_per_endpoint: int = 100,
        rate_limit: float = 10.0,
        timeout: float = 10.0,
        concurrent_requests: int = 5,
        use_schemathesis: bool = True
    ):
        super().__init__(base_url, headers, auth_token, rate_limit, timeout, concurrent_requests)
        self.spec_path = Path(spec_path)
        self.max_requests_per_endpoint = max_requests_per_endpoint
        self.spec = self._load_spec()
        self.use_schemathesis = use_schemathesis
        
        # Metadata for the report
        self.report.metadata["spec_type"] = "openapi"
        self.report.metadata["spec_path"] = str(self.spec_path)
        self.report.metadata["openapi_version"] = self.spec.get("openapi", "unknown")
        
        # Validate the spec
        try:
            validate_spec(self.spec)
            logger.info("OpenAPI specification validated successfully")
        except Exception as e:
            logger.warning(f"OpenAPI specification validation failed: {str(e)}")
    
    def _load_spec(self) -> Dict[str, Any]:
        """Load the OpenAPI specification from a file"""
        with open(self.spec_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if self.spec_path.suffix.lower() in [".yaml", ".yml"]:
            return yaml.safe_load(content)
        else:
            return json.loads(content)
    
    def _get_endpoints(self) -> List[Dict[str, Any]]:
        """Extract endpoints from the OpenAPI specification"""
        endpoints = []
        
        paths = self.spec.get("paths", {})
        for path, path_item in paths.items():
            for method, operation in path_item.items():
                if method.lower() in ["get", "post", "put", "delete", "patch"]:
                    endpoints.append({
                        "path": path,
                        "method": method.upper(),
                        "operation_id": operation.get("operationId", ""),
                        "parameters": operation.get("parameters", []),
                        "request_body": operation.get("requestBody", {}),
                        "responses": operation.get("responses", {})
                    })
        
        return endpoints

    def _generate_parameter_value(self, parameter: Dict[str, Any]) -> Any:
        """Generate a value for a parameter based on its schema"""
        schema = parameter.get("schema", {})
        param_type = schema.get("type", "string")
        param_format = schema.get("format")
        minimum = schema.get("minimum")
        maximum = schema.get("maximum")
        enum_values = schema.get("enum")
        
        return generate_fuzzed_value(
            data_type=param_type,
            format_type=param_format,
            min_val=minimum,
            max_val=maximum,
            enum_values=enum_values
        )
    
    def _generate_request_body(self, request_body_spec: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Generate a request body based on the OpenAPI specification"""
        if not request_body_spec:
            return None
        
        content = request_body_spec.get("content", {})
        json_content = content.get("application/json", {})
        schema = json_content.get("schema", {})
        
        if not schema:
            return {}
        
        # Handle references
        if "$ref" in schema:
            # For simplicity, we'll just return an empty object for referenced schemas
            # In a real implementation, you would resolve the reference
            return {}
        
        # Handle different schema types
        schema_type = schema.get("type")
        
        if schema_type == "object":
            properties = schema.get("properties", {})
            required = schema.get("required", [])
            body = {}
            
            for prop_name, prop_schema in properties.items():
                # Always include required properties, 80% chance to include optional ones
                if prop_name in required or random.random() < 0.8:
                    prop_type = prop_schema.get("type", "string")
                    prop_format = prop_schema.get("format")
                    minimum = prop_schema.get("minimum")
                    maximum = prop_schema.get("maximum")
                    enum_values = prop_schema.get("enum")
                    
                    body[prop_name] = generate_fuzzed_value(
                        data_type=prop_type,
                        format_type=prop_format,
                        min_val=minimum,
                        max_val=maximum,
                        enum_values=enum_values
                    )
            
            return body
        
        elif schema_type == "array":
            items_schema = schema.get("items", {})
            items_type = items_schema.get("type", "string")
            items_format = items_schema.get("format")
            
            # Generate a small array
            return [
                generate_fuzzed_value(
                    data_type=items_type,
                    format_type=items_format
                )
                for _ in range(random.randint(1, 5))
            ]
        
        else:
            # For primitives, just return a simple value
            return generate_fuzzed_value(
                data_type=schema_type or "string"
            )
    
    async def _fuzz_endpoint(self, endpoint: Dict[str, Any]) -> List[Issue]:
        """Fuzz a single API endpoint"""
        issues = []
        method = endpoint["method"]
        path = endpoint["path"]
        parameters = endpoint["parameters"]
        request_body_spec = endpoint["request_body"]
        
        # Replace path parameters with values
        path_with_params = path
        for param in parameters:
            if param.get("in") == "path":
                param_name = param.get("name", "")
                param_value = self._generate_parameter_value(param)
                path_with_params = path_with_params.replace(f"{{{param_name}}}", str(param_value))
        
        # Run multiple fuzz attempts for this endpoint
        num_requests = min(self.max_requests_per_endpoint, 20)  # Limit to 20 for testing
        
        for _ in tqdm(range(num_requests), desc=f"Fuzzing {method} {path}", leave=False):
            # Generate query parameters
            query_params = {}
            for param in parameters:
                if param.get("in") == "query":
                    param_name = param.get("name", "")
                    query_params[param_name] = self._generate_parameter_value(param)
            
            # Generate body data if needed
            body_data = None
            if method in ["POST", "PUT", "PATCH"]:
                body_data = self._generate_request_body(request_body_spec)
            
            # Send the request
            status, response_data, response_time = await self.send_request(
                method=method,
                endpoint=path_with_params,
                data=body_data,
                params=query_params
            )
            
            # Record the request in the report
            self.report.total_requests += 1
            
            # Analyze response for issues
            if status >= 500:
                self.report.failed_requests += 1
                issues.append(Issue(
                    title=f"Server Error ({status}) on {method} {path}",
                    description=f"The server returned a {status} error, indicating a potential crash or internal server error.",
                    endpoint=path,
                    method=method,
                    severity=IssueSeverity.HIGH,
                    request_data={"params": query_params, "body": body_data},
                    response_data=response_data
                ))
            elif status == 0:
                self.report.failed_requests += 1
                issues.append(Issue(
                    title=f"Request Failed on {method} {path}",
                    description="The request failed to complete, possibly due to a timeout or connection error.",
                    endpoint=path,
                    method=method,
                    severity=IssueSeverity.MEDIUM,
                    request_data={"params": query_params, "body": body_data},
                    response_data=response_data
                ))
            elif status >= 400:
                # Client error - this might be expected for invalid inputs
                self.report.failed_requests += 1
                # Only report 4xx as issues if they're unexpected
                if random.random() < 0.3:  # Only report some 4xx errors to avoid noise
                    issues.append(Issue(
                        title=f"Client Error ({status}) on {method} {path}",
                        description=f"The server returned a {status} error for the provided inputs.",
                        endpoint=path,
                        method=method,
                        severity=IssueSeverity.LOW,
                        request_data={"params": query_params, "body": body_data},
                        response_data=response_data
                    ))
            else:
                self.report.successful_requests += 1
                
                # Check for unusually slow responses
                if response_time > self.timeout * 0.8:
                    issues.append(Issue(
                        title=f"Slow Response on {method} {path}",
                        description=f"The request took {response_time:.2f}s to complete, which is unusually slow.",
                        endpoint=path,
                        method=method,
                        severity=IssueSeverity.LOW,
                        request_data={"params": query_params, "body": body_data},
                        response_data=response_data
                    ))
        
        return issues

    async def _run_schemathesis(self) -> List[Issue]:
        """Run Schemathesis for more comprehensive API testing"""
        issues = []
        
        # Create temporary file for Schemathesis results
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        try:
            # Convert headers to a list for Schemathesis
            headers_list = []
            for header_name, header_value in self.headers.items():
                headers_list.append(f"{header_name}:{header_value}")
            
            # Run Schemathesis using its Python API
            schema = schemathesis.from_path(
                path=str(self.spec_path),
                base_url=self.base_url
            )
            
            # Execute the test against all API operations
            for endpoint in schema.get_all_endpoints():
                for _ in range(min(5, self.max_requests_per_endpoint)):  # Limit to 5 tests per endpoint with Schemathesis
                    try:
                        case = endpoint.make_case()
                        response = case.call(headers=self.headers)
                        
                        # Record the request
                        self.report.total_requests += 1
                        
                        # Process the response
                        if response.status_code >= 500:
                            self.report.failed_requests += 1
                            issues.append(Issue(
                                title=f"Server Error ({response.status_code}) on {case.method} {case.path}",
                                description=f"The server returned a {response.status_code} error during Schemathesis testing.",
                                endpoint=case.path,
                                method=case.method,
                                severity=IssueSeverity.HIGH,
                                request_data={"params": case.query, "body": case.body},
                                response_data=response.json() if response.headers.get("content-type") == "application/json" else {"raw": str(response.content)}
                            ))
                        elif response.status_code >= 400:
                            self.report.failed_requests += 1
                        else:
                            self.report.successful_requests += 1
                    
                    except Exception as e:
                        logger.error(f"Schemathesis error: {str(e)}")
        
        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        
        return issues

    def run(self) -> FuzzingReport:
        """Run the OpenAPI fuzzing process and return the report"""
        logger.info("Starting OpenAPI fuzzing")
        
        # Get all endpoints from the spec
        endpoints = self._get_endpoints()
        logger.info(f"Found {len(endpoints)} endpoints in the OpenAPI specification")
        
        # Create an event loop for asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        issues = []
        
        try:
            if self.use_schemathesis:
                logger.info("Running Schemathesis tests")
                schemathesis_issues = loop.run_until_complete(self._run_schemathesis())
                issues.extend(schemathesis_issues)
                logger.info(f"Found {len(schemathesis_issues)} issues with Schemathesis")
            
            # Run custom fuzzing on each endpoint
            for endpoint in endpoints:
                endpoint_issues = loop.run_until_complete(self._fuzz_endpoint(endpoint))
                issues.extend(endpoint_issues)
        
        finally:
            loop.close()
        
        # Add all issues to the report
        for issue in issues:
            self.report.add_issue(issue)
        
        self.report.set_complete()
        logger.info(f"OpenAPI fuzzing completed. Found {len(issues)} issues.")
        
        return self.report


class GraphQLFuzzer(BaseFuzzer):
    """Fuzzer for GraphQL APIs"""
    
    def __init__(
        self,
        schema_path: Union[str, Path],
        base_url: str,
        headers: Optional[Union[Dict[str, str], str]] = None,
        auth_token: Optional[str] = None,
        max_requests_per_query: int = 100,
        rate_limit: float = 10.0,
        timeout: float = 10.0,
        concurrent_requests: int = 5
    ):
        super().__init__(base_url, headers, auth_token, rate_limit, timeout, concurrent_requests)
        self.schema_path = Path(schema_path)
        self.max_requests_per_query = max_requests_per_query
        self.schema_ast = self._load_schema()
        self.schema = build_ast_schema(self.schema_ast)
        
        # Metadata for the report
        self.report.metadata["spec_type"] = "graphql"
        self.report.metadata["spec_path"] = str(self.schema_path)
    
    def _load_schema(self):
        """Load and parse the GraphQL schema from a file"""
        with open(self.schema_path, "r", encoding="utf-8") as f:
            schema_str = f.read()
        
        try:
            schema_ast = graphql_parse(schema_str)
            logger.info("GraphQL schema parsed successfully")
            return schema_ast
        except Exception as e:
            logger.error(f"Failed to parse GraphQL schema: {str(e)}")
            raise
    
    def _get_queries_and_mutations(self) -> Dict[str, List[Dict[str, Any]]]:
        """Extract queries and mutations from the GraphQL schema"""
        operations = {"queries": [], "mutations": []}
        
        query_type = self.schema.get_query_type()
        mutation_type = self.schema.get_mutation_type()
        
        if query_type:
            fields = query_type.fields
            for field_name, field in fields.items():
                operations["queries"].append({
                    "name": field_name,
                    "args": field.args,
                    "type": field.type
                })
        
        if mutation_type:
            fields = mutation_type.fields
            for field_name, field in fields.items():
                operations["mutations"].append({
                    "name": field_name,
                    "args": field.args,
                    "type": field.type
                })
        
        return operations
    
    def _generate_argument_value(self, arg_type) -> Any:
        """Generate a value for a GraphQL argument based on its type"""
        # Convert GraphQL type to a basic type string
        type_str = str(arg_type)
        
        if "String" in type_str:
            return generate_fuzzed_value("string")
        elif "Int" in type_str:
            return generate_fuzzed_value("integer")
        elif "Float" in type_str:
            return generate_fuzzed_value("number")
        elif "Boolean" in type_str:
            return generate_fuzzed_value("boolean")
        elif "ID" in type_str:
            # IDs are typically strings or integers
            return str(generate_fuzzed_value("string"))
        else:
            # For complex types, return a simple string
            return generate_fuzzed_value("string")
    
    def _generate_query(self, operation: Dict[str, Any], depth: int = 2) -> str:
        """Generate a GraphQL query string for the given operation"""
        name = operation["name"]
        args = operation["args"]
        
        # Generate arguments
        arg_strings = []
        arg_values = {}
        
        for arg_name, arg in args.items():
            arg_value = self._generate_argument_value(arg.type)
            arg_values[arg_name] = arg_value
            
            # Format the argument value as a string
            if isinstance(arg_value, str):
                arg_strings.append(f"{arg_name}: \"{arg_value}\"")
            elif isinstance(arg_value, bool):
                arg_strings.append(f"{arg_name}: {str(arg_value).lower()}")
            else:
                arg_strings.append(f"{arg_name}: {arg_value}")
        
        arg_string = ", ".join(arg_strings)
        
        # For simplicity, we'll just request a few basic fields
        # In a real implementation, you would analyze the return type and build a more appropriate query
        fields = ["id", "name", "title", "description", "createdAt"]
        field_string = " ".join(fields)
        
        if arg_string:
            query = f"{{ {name}({arg_string}) {{ {field_string} }} }}"
        else:
            query = f"{{ {name} {{ {field_string} }} }}"
        
        return query, arg_values
    
    def _generate_mutation(self, operation: Dict[str, Any]) -> str:
        """Generate a GraphQL mutation string for the given operation"""
        name = operation["name"]
        args = operation["args"]
        
        # Generate arguments
        arg_strings = []
        arg_values = {}
        
        for arg_name, arg in args.items():
            arg_value = self._generate_argument_value(arg.type)
            arg_values[arg_name] = arg_value
            
            # Format the argument value as a string
            if isinstance(arg_value, str):
                arg_strings.append(f"{arg_name}: \"{arg_value}\"")
            elif isinstance(arg_value, bool):
                arg_strings.append(f"{arg_name}: {str(arg_value).lower()}")
            else:
                arg_strings.append(f"{arg_name}: {arg_value}")
        
        arg_string = ", ".join(arg_strings)
        
        # For simplicity, we'll just request a few basic fields
        fields = ["id", "success", "message", "createdAt"]
        field_string = " ".join(fields)
        
        if arg_string:
            mutation = f"mutation {{ {name}({arg_string}) {{ {field_string} }} }}"
        else:
            mutation = f"mutation {{ {name} {{ {field_string} }} }}"
        
        return mutation, arg_values
    
    async def _fuzz_query(self, operation: Dict[str, Any], is_mutation: bool = False) -> List[Issue]:
        """Fuzz a single GraphQL query or mutation"""
        issues = []
        
        # Generate the query string
        if is_mutation:
            operation_str, args = self._generate_mutation(operation)
            operation_type = "mutation"
        else:
            operation_str, args = self._generate_query(operation)
            operation_type = "query"
        
        name = operation["name"]
        
        # Run multiple fuzz attempts for this query
        num_requests = min(self.max_requests_per_query, 10)  # Limit to 10 for testing
        
        for _ in tqdm(range(num_requests), desc=f"Fuzzing {operation_type} {name}", leave=False):
            # Prepare the GraphQL request
            payload = {
                "query": operation_str
            }
            
            # Send the request
            status, response_data, response_time = await self.send_request(
                method="POST",
                endpoint="",  # GraphQL typically uses a single endpoint
                data=payload
            )
            
            # Record the request in the report
            self.report.total_requests += 1
            
            # Analyze response for issues
            if status >= 500:
                self.report.failed_requests += 1
                issues.append(Issue(
                    title=f"Server Error ({status}) on {operation_type} {name}",
                    description=f"The server returned a {status} error, indicating a potential crash or internal server error.",
                    endpoint="/graphql",
                    method="POST",
                    severity=IssueSeverity.HIGH,
                    request_data={"query": operation_str, "args": args},
                    response_data=response_data
                ))
            elif status == 0:
                self.report.failed_requests += 1
                issues.append(Issue(
                    title=f"Request Failed on {operation_type} {name}",
                    description="The request failed to complete, possibly due to a timeout or connection error.",
                    endpoint="/graphql",
                    method="POST",
                    severity=IssueSeverity.MEDIUM,
                    request_data={"query": operation_str, "args": args},
                    response_data=response_data
                ))
            elif status >= 400:
                # Client error - this might be expected for invalid inputs
                self.report.failed_requests += 1
                # Only report some 4xx errors to avoid noise
                if random.random() < 0.3:
                    issues.append(Issue(
                        title=f"Client Error ({status}) on {operation_type} {name}",
                        description=f"The server returned a {status} error for the provided inputs.",
                        endpoint="/graphql",
                        method="POST",
                        severity=IssueSeverity.LOW,
                        request_data={"query": operation_str, "args": args},
                        response_data=response_data
                    ))
            else:
                self.report.successful_requests += 1
                
                # Check for GraphQL-specific errors
                errors = response_data.get("errors", [])
                if errors:
                    issues.append(Issue(
                        title=f"GraphQL Errors on {operation_type} {name}",
                        description=f"The GraphQL request returned {len(errors)} errors in the response.",
                        endpoint="/graphql",
                        method="POST",
                        severity=IssueSeverity.MEDIUM,
                        request_data={"query": operation_str, "args": args},
                        response_data=response_data
                    ))
                
                # Check for unusually slow responses
                if response_time > self.timeout * 0.8:
                    issues.append(Issue(
                        title=f"Slow Response on {operation_type} {name}",
                        description=f"The request took {response_time:.2f}s to complete, which is unusually slow.",
                        endpoint="/graphql",
                        method="POST",
                        severity=IssueSeverity.LOW,
                        request_data={"query": operation_str, "args": args},
                        response_data=response_data
                    ))
        
        return issues
    
    def run(self) -> FuzzingReport:
        """Run the GraphQL fuzzing process and return the report"""
        logger.info("Starting GraphQL fuzzing")
        
        # Get all queries and mutations from the schema
        operations = self._get_queries_and_mutations()
        logger.info(f"Found {len(operations['queries'])} queries and {len(operations['mutations'])} mutations in the GraphQL schema")
        
        # Create an event loop for asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        issues = []
        
        try:
            # Fuzz queries
            for query in operations["queries"]:
                query_issues = loop.run_until_complete(self._fuzz_query(query, is_mutation=False))
                issues.extend(query_issues)
            
            # Fuzz mutations
            for mutation in operations["mutations"]:
                mutation_issues = loop.run_until_complete(self._fuzz_query(mutation, is_mutation=True))
                issues.extend(mutation_issues)
        
        finally:
            loop.close()
        
        # Add all issues to the report
        for issue in issues:
            self.report.add_issue(issue)
        
        self.report.set_complete()
        logger.info(f"GraphQL fuzzing completed. Found {len(issues)} issues.")
        
        return self.report 