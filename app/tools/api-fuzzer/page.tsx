"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title
);

// Define types
interface Parameter {
	name: string;
	type: string;
	required: boolean;
	location: "query" | "path" | "header" | "body";
	schema?: any;
	inScope: boolean;
}

interface Endpoint {
	id: string;
	path: string;
	method: string;
	summary?: string;
	parameters: Parameter[];
	selected: boolean;
}

interface FuzzingProfile {
	id: string;
	name: string;
	description: string;
	endpoints: string[];
	fuzzingMode: string;
	parameterScope: string[];
	rateLimit: number;
	concurrency: number;
	aiSuggestions: boolean;
	createdAt: string;
}

interface AISuggestion {
	id: string;
	payload: string;
	description: string;
	riskLevel: "High" | "Medium" | "Low";
	category: string;
}

interface TestResult {
	endpoint: string;
	method: string;
	payload: any;
	status: number;
	responseTime: number;
	anomaly: boolean;
	anomalyType?: string;
}

interface ScanSummary {
	totalEndpoints: number;
	totalTests: number;
	serverErrors: number;
	clientErrors: number;
	slowResponses: number;
	unexpectedResponses: number;
	completedTests: number;
	inProgressEndpoint?: string;
}

// Chart components
const AnomalySummaryChart = ({ summary }: { summary: ScanSummary }) => {
	const data = {
		labels: [
			"Server Errors",
			"Client Errors",
			"Slow Responses",
			"Unexpected Responses",
		],
		datasets: [
			{
				label: "API Issues Found",
				data: [
					summary.serverErrors || 0,
					summary.clientErrors || 0,
					summary.slowResponses || 0,
					summary.unexpectedResponses || 0,
				],
				backgroundColor: [
					"rgba(220, 38, 38, 0.7)", // red-600 with opacity
					"rgba(245, 158, 11, 0.7)", // amber-500 with opacity
					"rgba(124, 58, 237, 0.7)", // violet-600 with opacity
					"rgba(59, 130, 246, 0.7)", // blue-500 with opacity
				],
				borderColor: [
					"rgb(220, 38, 38)",
					"rgb(245, 158, 11)",
					"rgb(124, 58, 237)",
					"rgb(59, 130, 246)",
				],
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "right" as const,
			},
			title: {
				display: true,
				text: "Anomaly Distribution",
				color: "#1e3a8a", // blue-900
				font: {
					size: 16,
				},
			},
		},
	};

	return (
		<div className="h-64 md:h-80">
			<Doughnut data={data} options={options} />
		</div>
	);
};

const TestProgressChart = ({ summary }: { summary: ScanSummary }) => {
	const completedPercentage =
		summary.totalTests > 0
			? Math.round((summary.completedTests / summary.totalTests) * 100)
			: 0;

	const data = {
		labels: ["Completed", "Remaining"],
		datasets: [
			{
				label: "Test Progress",
				data: [completedPercentage, 100 - completedPercentage],
				backgroundColor: [
					"rgba(16, 185, 129, 0.7)", // emerald-500 with opacity
					"rgba(209, 213, 219, 0.7)", // gray-300 with opacity
				],
				borderColor: ["rgb(16, 185, 129)", "rgb(209, 213, 219)"],
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: `Test Progress: ${completedPercentage}%`,
				color: "#1e3a8a", // blue-900
				font: {
					size: 16,
				},
			},
		},
		cutout: "70%",
	};

	return (
		<div className="h-64 relative">
			<Doughnut data={data} options={options} />
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-3xl font-bold">{completedPercentage}%</span>
			</div>
		</div>
	);
};

export default function ApiFuzzerPage() {
	// State management
	const [activeTab, setActiveTab] = useState("setup");
	const [targetUrl, setTargetUrl] = useState("");
	const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
	const [fuzzingMode, setFuzzingMode] = useState("simple");
	const [parameterScope, setParameterScope] = useState<string[]>([
		"query",
		"body",
	]);
	const [rateLimit, setRateLimit] = useState(10);
	const [concurrency, setConcurrency] = useState(5);
	const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
	const [showAiSuggestions, setShowAiSuggestions] = useState(true);
	const [profiles, setProfiles] = useState<FuzzingProfile[]>([]);
	const [selectedProfile, setSelectedProfile] = useState<string>("");
	const [newProfileName, setNewProfileName] = useState("");
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [previewPayloads, setPreviewPayloads] = useState<
		{
			endpoint: string;
			parameter: string;
			location: string;
			testPayload: string;
			description: string;
		}[]
	>([]);
	const [scanning, setScanning] = useState(false);
	const [scanResults, setScanResults] = useState<TestResult[]>([]);
	const [showDetails, setShowDetails] = useState(false);
	const [isDiscovering, setIsDiscovering] = useState(false);

	// Add new state variables for button statuses and error handling
	const [discoveryStatus, setDiscoveryStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [discoveryError, setDiscoveryError] = useState<string>("");
	const [fuzzingStatus, setFuzzingStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [fuzzingError, setFuzzingError] = useState<string>("");
	const [profileStatus, setProfileStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [profileError, setProfileError] = useState<string>("");

	// Add discovery status message for real-time UI feedback
	const [discoveryStatusMessage, setDiscoveryStatusMessage] =
		useState<string>("");

	// Add console logs state for UI display
	const [consoleLogs, setConsoleLogs] = useState<
		Array<{
			id: string;
			timestamp: string;
			type: "info" | "success" | "warning" | "error";
			message: string;
		}>
	>([]);

	// Function to add log to UI console
	const addConsoleLog = (
		type: "info" | "success" | "warning" | "error",
		message: string
	) => {
		const logEntry = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			timestamp: new Date().toLocaleTimeString(),
			type,
			message,
		};
		setConsoleLogs((prev) => [...prev, logEntry]);

		// Also log to browser console with appropriate method
		switch (type) {
			case "error":
				console.error(`❌ ${message}`);
				break;
			case "warning":
				console.warn(`⚠️ ${message}`);
				break;
			case "success":
				console.log(`✅ ${message}`);
				break;
			default:
				console.log(`ℹ️ ${message}`);
		}
	};

	// Function to clear console logs
	const clearConsoleLogs = () => {
		setConsoleLogs([]);
		console.clear();
	};

	// Ref for auto-scrolling console logs
	const consoleLogsRef = useRef<HTMLDivElement>(null);

	// Auto-scroll console logs to bottom when new logs are added
	useEffect(() => {
		if (consoleLogsRef.current) {
			consoleLogsRef.current.scrollTop = consoleLogsRef.current.scrollHeight;
		}
	}, [consoleLogs]);

	// Load saved profiles on component mount
	useEffect(() => {
		const savedProfiles = localStorage.getItem("api-fuzzer-profiles");
		if (savedProfiles) {
			setProfiles(JSON.parse(savedProfiles));
		}
	}, []);

	// Debug logging for Results tab
	useEffect(() => {
		if (activeTab === "results") {
			console.log("🔍 Results Tab Debug:", {
				scanning,
				scanResultsLength: scanResults.length,
				fuzzingStatus,
				fuzzingError,
				endpointsSelected: endpoints.filter((e) => e.selected).length,
				targetUrl,
				parameterScope,
			});
		}
	}, [
		activeTab,
		scanning,
		scanResults.length,
		fuzzingStatus,
		fuzzingError,
		endpoints,
	]);

	// Save profiles to localStorage
	const saveProfiles = (updatedProfiles: FuzzingProfile[]) => {
		setProfiles(updatedProfiles);
		localStorage.setItem(
			"api-fuzzer-profiles",
			JSON.stringify(updatedProfiles)
		);
	};

	// Real endpoint discovery
	const discoverEndpoints = async () => {
		// Clear previous logs and start fresh
		clearConsoleLogs();
		addConsoleLog(
			"info",
			"Console logging initialized - API Fuzzer starting..."
		);
		addConsoleLog(
			"info",
			`Browser: ${navigator.userAgent.split(" ").slice(-2).join(" ")}`
		);
		addConsoleLog("info", `Timestamp: ${new Date().toISOString()}`);

		if (!targetUrl) {
			addConsoleLog("warning", "Discovery failed: No target URL provided");
			setDiscoveryError("Please enter a target URL");
			setDiscoveryStatus("error");
			return;
		}

		addConsoleLog("info", `Starting endpoint discovery for: ${targetUrl}`);
		addConsoleLog("success", "Target URL validation passed");

		setScanning(true);
		setIsDiscovering(true);
		setDiscoveryStatus("loading");
		setDiscoveryError("");
		setDiscoveryStatusMessage("Initializing endpoint discovery...");

		try {
			let discoveredEndpoints: Endpoint[] = [];

			// Check if URL is an OpenAPI/Swagger spec
			if (
				targetUrl.includes("swagger") ||
				targetUrl.includes("openapi") ||
				targetUrl.endsWith(".json") ||
				targetUrl.endsWith(".yaml")
			) {
				addConsoleLog("info", "Detected OpenAPI/Swagger specification URL");
				addConsoleLog("info", "Parsing OpenAPI specification...");
				setDiscoveryStatusMessage("Detected OpenAPI/Swagger spec - parsing...");
				discoveredEndpoints = await parseOpenAPISpec(targetUrl);
				addConsoleLog(
					"success",
					`Successfully parsed OpenAPI spec: ${discoveredEndpoints.length} endpoints found`
				);
				setDiscoveryStatusMessage(
					`Successfully parsed OpenAPI spec: ${discoveredEndpoints.length} endpoints found`
				);
			} else {
				// Try to discover endpoints by crawling
				addConsoleLog(
					"info",
					"No OpenAPI spec detected, attempting endpoint crawling..."
				);
				addConsoleLog("info", "Probing common API endpoints...");
				setDiscoveryStatusMessage(
					"No OpenAPI spec detected - probing common endpoints..."
				);
				discoveredEndpoints = await crawlAPIEndpoints(targetUrl);
				addConsoleLog(
					"success",
					`Endpoint crawling completed: ${discoveredEndpoints.length} endpoints discovered`
				);
				setDiscoveryStatusMessage(
					`Endpoint crawling completed: ${discoveredEndpoints.length} endpoints discovered`
				);
			}

			setEndpoints(discoveredEndpoints);
			addConsoleLog(
				"info",
				"Generating AI suggestions based on discovered endpoints..."
			);
			setDiscoveryStatusMessage("Generating AI suggestions...");
			generateAISuggestions(discoveredEndpoints);
			addConsoleLog("success", "AI suggestions generated successfully");

			setDiscoveryStatus("success");
			addConsoleLog("success", "Endpoint discovery completed successfully!");
			addConsoleLog(
				"info",
				`Discovery Summary: ${
					discoveredEndpoints.length
				} total endpoints, Methods: [${[
					...new Set(discoveredEndpoints.map((e) => e.method)),
				].join(", ")}], Unique paths: ${
					[...new Set(discoveredEndpoints.map((e) => e.path))].length
				}`
			);
			setDiscoveryStatusMessage(
				`Discovery completed! Found ${discoveredEndpoints.length} endpoints`
			);
		} catch (error) {
			addConsoleLog(
				"error",
				`Endpoint discovery failed: ${
					error instanceof Error ? error.message : "Unknown error occurred"
				}`
			);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setDiscoveryError(errorMessage);
			setDiscoveryStatus("error");
			setDiscoveryStatusMessage(`Discovery failed: ${errorMessage}`);
			alert(
				`Failed to discover endpoints: ${errorMessage}\n\nPlease check the URL and try again.`
			);
		} finally {
			setScanning(false);
			setIsDiscovering(false);
		}
	};

	// Parse OpenAPI/Swagger specification
	const parseOpenAPISpec = async (specUrl: string): Promise<Endpoint[]> => {
		try {
			addConsoleLog("info", `Fetching OpenAPI specification from: ${specUrl}`);
			const response = await fetch(specUrl);
			if (!response.ok) {
				const errorMsg = `Failed to fetch spec: ${response.status} ${response.statusText}`;
				addConsoleLog("error", errorMsg);
				throw new Error(errorMsg);
			}

			addConsoleLog(
				"success",
				"Specification fetched successfully, parsing JSON..."
			);
			const spec = await response.json();
			addConsoleLog(
				"info",
				`Specification parsed - Title: ${
					spec.info?.title || "Unknown"
				}, Version: ${spec.info?.version || "Unknown"}, Paths: ${
					Object.keys(spec.paths || {}).length
				}`
			);

			const endpoints: Endpoint[] = [];

			// Parse OpenAPI 3.x or Swagger 2.x
			const paths = spec.paths || {};
			const basePath = spec.basePath || "";
			addConsoleLog("info", `Processing ${Object.keys(paths).length} paths...`);

			Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
				addConsoleLog("info", `Processing path: ${path}`);
				Object.entries(pathItem).forEach(
					([method, operation]: [string, any]) => {
						if (
							[
								"get",
								"post",
								"put",
								"delete",
								"patch",
								"head",
								"options",
							].includes(method.toLowerCase())
						) {
							addConsoleLog(
								"info",
								`  Processing ${method.toUpperCase()} operation`
							);
							const parameters: Parameter[] = [];

							// Parse parameters
							const allParams = [
								...(operation.parameters || []),
								...(pathItem.parameters || []),
							];

							addConsoleLog("info", `    Found ${allParams.length} parameters`);
							allParams.forEach((param: any) => {
								parameters.push({
									name: param.name,
									type: param.type || param.schema?.type || "string",
									required: param.required || false,
									location: param.in as "query" | "path" | "header" | "body",
									inScope: true, // Set all parameters as in scope by default
									schema: param.schema,
								});
							});

							// Parse request body for POST/PUT/PATCH
							if (
								operation.requestBody &&
								["post", "put", "patch"].includes(method.toLowerCase())
							) {
								addConsoleLog(
									"info",
									`    Processing request body for ${method.toUpperCase()}`
								);
								const content = operation.requestBody.content;
								if (content) {
									Object.entries(content).forEach(
										([mediaType, mediaTypeObj]: [string, any]) => {
											if (mediaType.includes("json") && mediaTypeObj.schema) {
												const schema = mediaTypeObj.schema;
												if (schema.properties) {
													const bodyParamCount = Object.keys(
														schema.properties
													).length;
													addConsoleLog(
														"info",
														`      Found ${bodyParamCount} body properties`
													);
													Object.entries(schema.properties).forEach(
														([propName, propSchema]: [string, any]) => {
															parameters.push({
																name: propName,
																type: propSchema.type || "string",
																required:
																	schema.required?.includes(propName) || false,
																location: "body",
																inScope: true,
																schema: propSchema,
															});
														}
													);
												}
											}
										}
									);
								}
							}

							const endpointId = `${method}-${path}`;
							endpoints.push({
								id: endpointId,
								path: basePath + path,
								method: method.toUpperCase(),
								summary: operation.summary || operation.description || "",
								parameters,
								selected: true,
							});
							addConsoleLog(
								"success",
								`    Added endpoint: ${method.toUpperCase()} ${
									basePath + path
								} (${parameters.length} params)`
							);
						}
					}
				);
			});

			addConsoleLog(
				"success",
				`OpenAPI parsing completed: ${endpoints.length} endpoints extracted`
			);
			return endpoints;
		} catch (error) {
			addConsoleLog(
				"error",
				`Error parsing OpenAPI spec: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			throw error;
		}
	};

	// Crawl API endpoints by making requests
	const crawlAPIEndpoints = async (baseUrl: string): Promise<Endpoint[]> => {
		addConsoleLog("info", `Starting API endpoint crawling for: ${baseUrl}`);
		const endpoints: Endpoint[] = [];
		const commonPaths = [
			"/api",
			"/api/v1",
			"/api/v2",
			"/v1",
			"/v2",
			"/users",
			"/user",
			"/auth",
			"/login",
			"/register",
			"/products",
			"/items",
			"/data",
			"/health",
			"/status",
		];

		const commonEndpoints = [
			{ path: "/users", methods: ["GET", "POST"] },
			{ path: "/users/{id}", methods: ["GET", "PUT", "DELETE"] },
			{ path: "/auth/login", methods: ["POST"] },
			{ path: "/auth/register", methods: ["POST"] },
			{ path: "/products", methods: ["GET", "POST"] },
			{ path: "/products/{id}", methods: ["GET", "PUT", "DELETE"] },
			{ path: "/health", methods: ["GET"] },
			{ path: "/status", methods: ["GET"] },
		];

		// Try to find OpenAPI spec first
		const specUrls = [
			`${baseUrl}/swagger.json`,
			`${baseUrl}/swagger.yaml`,
			`${baseUrl}/openapi.json`,
			`${baseUrl}/openapi.yaml`,
			`${baseUrl}/api-docs`,
			`${baseUrl}/docs/swagger.json`,
			`${baseUrl}/v1/swagger.json`,
			`${baseUrl}/api/swagger.json`,
		];

		addConsoleLog(
			"info",
			"First attempting to discover OpenAPI specifications..."
		);
		for (const specUrl of specUrls) {
			try {
				addConsoleLog("info", `  Checking for spec at: ${specUrl}`);
				const response = await fetch(specUrl, { method: "HEAD" });
				if (response.ok) {
					addConsoleLog("success", `Found OpenAPI spec at: ${specUrl}`);
					return await parseOpenAPISpec(specUrl);
				}
				addConsoleLog("info", `  No spec found at: ${specUrl}`);
			} catch (error) {
				addConsoleLog(
					"warning",
					`  Error checking ${specUrl}: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
				// Continue to next spec URL
			}
		}

		addConsoleLog(
			"info",
			"No OpenAPI specs found, probing common endpoints..."
		);
		let probeCount = 0;
		let foundCount = 0;

		// If no spec found, probe common endpoints
		for (const endpoint of commonEndpoints) {
			for (const method of endpoint.methods) {
				try {
					probeCount++;
					const testUrl = `${baseUrl}${endpoint.path}`;
					addConsoleLog(
						"info",
						`Probing ${probeCount}/${
							commonEndpoints.length * 2
						}: ${method} ${testUrl}`
					);

					const response = await fetch(testUrl, {
						method: "HEAD",
						mode: "cors",
					});

					// If endpoint responds (even with error), it exists
					if (response.status !== 0) {
						foundCount++;
						addConsoleLog(
							"success",
							`Found endpoint: ${method} ${endpoint.path} (Status: ${response.status})`
						);

						const parameters: Parameter[] = [];

						// Add common parameters based on endpoint pattern
						if (endpoint.path.includes("{id}")) {
							parameters.push({
								name: "id",
								type: "string",
								required: true,
								location: "path",
								inScope: true,
							});
							addConsoleLog("info", `    Added path parameter: id`);
						}

						if (method === "GET") {
							parameters.push(
								{
									name: "page",
									type: "integer",
									required: false,
									location: "query",
									inScope: true,
								},
								{
									name: "limit",
									type: "integer",
									required: false,
									location: "query",
									inScope: true,
								}
							);
							addConsoleLog("info", `    Added query parameters: page, limit`);
						}

						if (["POST", "PUT", "PATCH"].includes(method)) {
							// Add common body parameters
							if (
								endpoint.path.includes("users") ||
								endpoint.path.includes("register")
							) {
								parameters.push(
									{
										name: "name",
										type: "string",
										required: true,
										location: "body",
										inScope: true,
									},
									{
										name: "email",
										type: "string",
										required: true,
										location: "body",
										inScope: true,
									}
								);
								addConsoleLog("info", `    Added body parameters: name, email`);
							}
						}

						// Add authorization header
						parameters.push({
							name: "Authorization",
							type: "string",
							required: false,
							location: "header",
							inScope: false,
						});

						endpoints.push({
							id: `${method.toLowerCase()}-${endpoint.path}`,
							path: endpoint.path,
							method,
							summary: `${method} ${endpoint.path}`,
							parameters,
							selected: true,
						});
						addConsoleLog(
							"success",
							`    Added endpoint with ${parameters.length} parameters`
						);
					} else {
						addConsoleLog(
							"info",
							`  No response from: ${method} ${endpoint.path}`
						);
					}
				} catch (error) {
					addConsoleLog(
						"warning",
						`  Error probing ${method} ${endpoint.path}: ${
							error instanceof Error ? error.message : "CORS/Network error"
						}`
					);
					// Endpoint doesn't exist or CORS issue, continue
				}
			}
		}

		addConsoleLog(
			"info",
			`Crawling completed: ${foundCount} endpoints found out of ${probeCount} probes`
		);

		if (endpoints.length === 0) {
			const errorMsg =
				"No API endpoints discovered. The target may not be an API or may have CORS restrictions.";
			addConsoleLog("error", errorMsg);
			throw new Error(errorMsg);
		}

		addConsoleLog("success", "Endpoint crawling completed successfully!");
		return endpoints;
	};

	// Generate context-aware AI suggestions
	const generateAISuggestions = (endpoints: Endpoint[]) => {
		const suggestions: AISuggestion[] = [];
		const parameterTypes = new Set<string>();
		const endpointPaths = endpoints.map((e) => e.path.toLowerCase());

		// Analyze discovered endpoints to generate relevant suggestions
		endpoints.forEach((endpoint) => {
			endpoint.parameters.forEach((param) => {
				parameterTypes.add(param.type);
			});
		});

		// SQL Injection payloads for string parameters
		if (parameterTypes.has("string") || parameterTypes.has("text")) {
			suggestions.push(
				{
					id: "sql-1",
					payload: "' OR '1'='1",
					description: "Basic SQL injection test for authentication bypass",
					riskLevel: "High",
					category: "SQL Injection",
				},
				{
					id: "sql-2",
					payload: "'; DROP TABLE users; --",
					description: "SQL injection with table drop attempt",
					riskLevel: "High",
					category: "SQL Injection",
				},
				{
					id: "sql-3",
					payload: "' UNION SELECT username,password FROM users --",
					description: "SQL injection with UNION to extract data",
					riskLevel: "High",
					category: "SQL Injection",
				}
			);
		}

		// XSS payloads for web-facing endpoints
		if (
			endpointPaths.some(
				(path) =>
					path.includes("user") ||
					path.includes("comment") ||
					path.includes("post")
			)
		) {
			suggestions.push(
				{
					id: "xss-1",
					payload: "<script>alert('XSS')</script>",
					description: "Basic XSS payload for script injection",
					riskLevel: "High",
					category: "Cross-Site Scripting",
				},
				{
					id: "xss-2",
					payload: "<img src=x onerror=alert('XSS')>",
					description: "XSS via image tag with error handler",
					riskLevel: "High",
					category: "Cross-Site Scripting",
				}
			);
		}

		// Path traversal for file-related endpoints
		if (
			endpointPaths.some(
				(path) =>
					path.includes("file") ||
					path.includes("upload") ||
					path.includes("download")
			)
		) {
			suggestions.push(
				{
					id: "path-1",
					payload: "../../../etc/passwd",
					description: "Path traversal to access system files",
					riskLevel: "High",
					category: "Path Traversal",
				},
				{
					id: "path-2",
					payload: "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
					description: "Windows path traversal attempt",
					riskLevel: "High",
					category: "Path Traversal",
				}
			);
		}

		// Integer overflow for numeric parameters
		if (parameterTypes.has("integer") || parameterTypes.has("number")) {
			suggestions.push(
				{
					id: "int-1",
					payload: "2147483648",
					description: "32-bit integer overflow test",
					riskLevel: "Medium",
					category: "Integer Overflow",
				},
				{
					id: "int-2",
					payload: "-2147483649",
					description: "32-bit integer underflow test",
					riskLevel: "Medium",
					category: "Integer Overflow",
				}
			);
		}

		// Buffer overflow tests
		suggestions.push(
			{
				id: "buffer-1",
				payload: "A".repeat(1000),
				description: "Buffer overflow test with 1000 characters",
				riskLevel: "Medium",
				category: "Buffer Overflow",
			},
			{
				id: "buffer-2",
				payload: "A".repeat(10000),
				description: "Large buffer overflow test with 10000 characters",
				riskLevel: "Medium",
				category: "Buffer Overflow",
			}
		);

		// Command injection for endpoints that might execute commands
		if (
			endpointPaths.some(
				(path) =>
					path.includes("exec") || path.includes("cmd") || path.includes("run")
			)
		) {
			suggestions.push(
				{
					id: "cmd-1",
					payload: "; cat /etc/passwd",
					description: "Command injection to read system files",
					riskLevel: "High",
					category: "Command Injection",
				},
				{
					id: "cmd-2",
					payload: "| whoami",
					description: "Command injection to identify current user",
					riskLevel: "High",
					category: "Command Injection",
				}
			);
		}

		// NoSQL injection for modern APIs
		suggestions.push(
			{
				id: "nosql-1",
				payload: '{"$ne": null}',
				description: "NoSQL injection using $ne operator",
				riskLevel: "High",
				category: "NoSQL Injection",
			},
			{
				id: "nosql-2",
				payload: '{"$gt": ""}',
				description: "NoSQL injection using $gt operator",
				riskLevel: "High",
				category: "NoSQL Injection",
			}
		);

		// LDAP injection
		if (
			endpointPaths.some(
				(path) =>
					path.includes("auth") ||
					path.includes("login") ||
					path.includes("user")
			)
		) {
			suggestions.push({
				id: "ldap-1",
				payload: "*)(uid=*))(|(uid=*",
				description: "LDAP injection for authentication bypass",
				riskLevel: "Medium",
				category: "LDAP Injection",
			});
		}

		// Format string vulnerabilities
		suggestions.push({
			id: "format-1",
			payload: "%x%x%x%x%x%x%x%x",
			description: "Format string vulnerability test",
			riskLevel: "Medium",
			category: "Format String",
		});

		// Null byte injection
		suggestions.push({
			id: "null-1",
			payload: "test%00.txt",
			description: "Null byte injection to bypass file extension checks",
			riskLevel: "Medium",
			category: "Null Byte Injection",
		});

		// Sort by risk level and limit to top 10
		const sortedSuggestions = suggestions.sort((a, b) => {
			const riskOrder = { High: 3, Medium: 2, Low: 1 };
			return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
		});

		setAiSuggestions(sortedSuggestions.slice(0, 10));
	};

	// Generate preview payloads with real test data
	const generatePreviewPayloads = () => {
		addConsoleLog("info", "🔍 Generating payload preview...");
		const selectedEndpoints = endpoints.filter((e) => e.selected);
		addConsoleLog(
			"info",
			`Selected endpoints for preview: ${selectedEndpoints.length}`
		);

		const payloads: {
			endpoint: string;
			parameter: string;
			location: string;
			testPayload: string;
			description: string;
		}[] = [];

		selectedEndpoints.forEach((endpoint, endpointIndex) => {
			addConsoleLog(
				"info",
				`Processing endpoint ${endpointIndex + 1}: ${endpoint.method} ${
					endpoint.path
				}`
			);
			addConsoleLog("info", `  Parameters: ${endpoint.parameters.length}`);

			endpoint.parameters.forEach((param, paramIndex) => {
				addConsoleLog(
					"info",
					`  Parameter ${paramIndex + 1}: ${param.name} (${param.type}, ${
						param.location
					}, inScope: ${param.inScope})`
				);

				if (param.inScope && parameterScope.includes(param.location)) {
					addConsoleLog("info", `    ✅ Parameter ${param.name} is in scope`);

					// Generate actual test payloads for preview
					const testPayloads = generateTestPayloads(param, fuzzingMode);
					addConsoleLog(
						"info",
						`    Generated ${testPayloads.length} test payloads for ${param.name}`
					);

					// Show first few payloads for each parameter
					testPayloads.slice(0, 3).forEach((payload, index) => {
						const previewPayload = {
							endpoint: `${endpoint.method} ${endpoint.path}`,
							parameter: param.name,
							location: param.location,
							testPayload:
								typeof payload === "object"
									? JSON.stringify(payload)
									: String(payload),
							description: `${fuzzingMode} fuzzing test ${index + 1} for ${
								param.type
							} parameter`,
						};
						payloads.push(previewPayload);
						addConsoleLog(
							"info",
							`    Added preview payload: ${previewPayload.testPayload}`
						);
					});
				} else {
					addConsoleLog(
						"info",
						`    ⏭️ Parameter ${param.name} skipped - not in scope or wrong location`
					);
					addConsoleLog(
						"info",
						`      inScope: ${param.inScope}, location: ${
							param.location
						}, parameterScope: [${parameterScope.join(", ")}]`
					);
				}
			});
		});

		addConsoleLog("success", `Generated ${payloads.length} preview payloads`);
		setPreviewPayloads(payloads.slice(0, 20)); // Show first 20 for preview

		if (payloads.length === 0) {
			addConsoleLog(
				"warning",
				"No preview payloads generated - check endpoint selection and parameter scope"
			);
		}
	};

	// Save current configuration as profile
	const saveProfile = () => {
		if (!newProfileName.trim()) {
			console.warn("🚫 Profile save failed: No profile name provided");
			setProfileError("Please enter a profile name");
			setProfileStatus("error");
			return;
		}

		console.log("💾 Saving fuzzing profile:", newProfileName);
		setProfileStatus("loading");
		setProfileError("");

		try {
			const newProfile: FuzzingProfile = {
				id: Date.now().toString(),
				name: newProfileName,
				description: `Profile for ${targetUrl}`,
				endpoints: endpoints.filter((e) => e.selected).map((e) => e.id),
				fuzzingMode,
				parameterScope,
				rateLimit,
				concurrency,
				aiSuggestions: showAiSuggestions,
				createdAt: new Date().toISOString(),
			};

			console.log("📋 Profile configuration:", {
				name: newProfile.name,
				endpointCount: newProfile.endpoints.length,
				fuzzingMode: newProfile.fuzzingMode,
				parameterScope: newProfile.parameterScope,
				rateLimit: newProfile.rateLimit,
				concurrency: newProfile.concurrency,
			});

			const updatedProfiles = [...profiles, newProfile];
			saveProfiles(updatedProfiles);
			setNewProfileName("");
			setShowProfileModal(false);
			setProfileStatus("success");

			console.log("✅ Profile saved successfully!");
			console.log(`📊 Total profiles: ${updatedProfiles.length}`);
		} catch (error) {
			console.error("❌ Failed to save profile:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred while saving profile";
			setProfileError(errorMessage);
			setProfileStatus("error");
		}
	};

	// Load profile
	const loadProfile = (profileId: string) => {
		const profile = profiles.find((p) => p.id === profileId);
		if (!profile) {
			console.warn("🚫 Profile load failed: Profile not found");
			setProfileError("Profile not found");
			setProfileStatus("error");
			return;
		}

		console.log("📂 Loading fuzzing profile:", profile.name);
		setProfileStatus("loading");
		setProfileError("");

		try {
			console.log("📋 Loading profile configuration:", {
				name: profile.name,
				endpointCount: profile.endpoints.length,
				fuzzingMode: profile.fuzzingMode,
				parameterScope: profile.parameterScope,
				rateLimit: profile.rateLimit,
				concurrency: profile.concurrency,
			});

			setFuzzingMode(profile.fuzzingMode);
			setParameterScope(profile.parameterScope);
			setRateLimit(profile.rateLimit);
			setConcurrency(profile.concurrency);
			setShowAiSuggestions(profile.aiSuggestions);

			// Update endpoint selection
			setEndpoints((prev) =>
				prev.map((e) => ({
					...e,
					selected: profile.endpoints.includes(e.id),
				}))
			);

			setProfileStatus("success");
			console.log("✅ Profile loaded successfully!");
			console.log(
				`🎯 Selected ${profile.endpoints.length} endpoints from profile`
			);
		} catch (error) {
			console.error("❌ Failed to load profile:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred while loading profile";
			setProfileError(errorMessage);
			setProfileStatus("error");
		}
	};

	// Delete profile
	const deleteProfile = (profileId: string) => {
		const profile = profiles.find((p) => p.id === profileId);
		if (!profile) {
			console.warn("🚫 Profile delete failed: Profile not found");
			return;
		}

		console.log("🗑️ Deleting fuzzing profile:", profile.name);

		try {
			const updatedProfiles = profiles.filter((p) => p.id !== profileId);
			saveProfiles(updatedProfiles);
			if (selectedProfile === profileId) {
				setSelectedProfile("");
			}

			console.log("✅ Profile deleted successfully!");
			console.log(`📊 Remaining profiles: ${updatedProfiles.length}`);
		} catch (error) {
			console.error("❌ Failed to delete profile:", error);
		}
	};

	// Real fuzzing with actual HTTP requests
	const startFuzzing = async () => {
		const selectedEndpoints = endpoints.filter((e) => e.selected);

		addConsoleLog("info", "🚀 Starting API fuzzing process...");
		addConsoleLog("info", `Total endpoints available: ${endpoints.length}`);
		addConsoleLog("info", `Selected endpoints: ${selectedEndpoints.length}`);

		if (selectedEndpoints.length === 0) {
			addConsoleLog("warning", "Fuzzing failed: No endpoints selected");
			setFuzzingError("Please select at least one endpoint to fuzz");
			setFuzzingStatus("error");
			return;
		}

		addConsoleLog(
			"info",
			`Fuzzing Configuration: Target URL: ${targetUrl}, Mode: ${fuzzingMode}, Parameter Scope: [${parameterScope.join(
				", "
			)}], Rate Limit: ${rateLimit}/s, Concurrency: ${concurrency}`
		);

		// Log selected endpoints details
		selectedEndpoints.forEach((endpoint, index) => {
			addConsoleLog(
				"info",
				`Endpoint ${index + 1}: ${endpoint.method} ${endpoint.path} (${
					endpoint.parameters.length
				} parameters)`
			);
			endpoint.parameters.forEach((param) => {
				if (param.inScope && parameterScope.includes(param.location)) {
					addConsoleLog(
						"info",
						`  - ${param.name} (${param.type}, ${param.location}) - IN SCOPE`
					);
				} else {
					addConsoleLog(
						"info",
						`  - ${param.name} (${param.type}, ${param.location}) - SKIPPED`
					);
				}
			});
		});

		setScanning(true);
		setActiveTab("results");
		setScanResults([]);
		setFuzzingStatus("loading");
		setFuzzingError("");

		const results: TestResult[] = [];
		let testCount = 0;
		let totalEstimatedTests = 0;

		// Calculate total estimated tests
		for (const endpoint of selectedEndpoints) {
			for (const parameter of endpoint.parameters) {
				if (parameter.inScope && parameterScope.includes(parameter.location)) {
					const testPayloads = generateTestPayloads(parameter, fuzzingMode);
					totalEstimatedTests += testPayloads.length;
				}
			}
		}

		addConsoleLog("success", `Estimated total tests: ${totalEstimatedTests}`);

		if (totalEstimatedTests === 0) {
			addConsoleLog(
				"warning",
				"No tests to execute - check parameter scope settings"
			);
			setFuzzingError(
				"No parameters in scope for testing. Please check your parameter scope settings."
			);
			setFuzzingStatus("error");
			setScanning(false);
			return;
		}

		try {
			for (const endpoint of selectedEndpoints) {
				addConsoleLog(
					"info",
					`🎯 Testing endpoint: ${endpoint.method} ${endpoint.path}`
				);
				const baseUrl = targetUrl.replace(/\/+$/, ""); // Remove trailing slashes

				for (const parameter of endpoint.parameters) {
					if (
						!parameter.inScope ||
						!parameterScope.includes(parameter.location)
					) {
						addConsoleLog(
							"info",
							`  ⏭️ Skipping parameter ${parameter.name} (${parameter.location}) - not in scope`
						);
						continue;
					}

					addConsoleLog(
						"info",
						`  🔧 Testing parameter: ${parameter.name} (${parameter.type}, ${parameter.location})`
					);

					// Generate test payloads based on fuzzing mode
					const testPayloads = generateTestPayloads(parameter, fuzzingMode);
					addConsoleLog(
						"info",
						`    📦 Generated ${testPayloads.length} test payloads for ${parameter.name}`
					);

					for (let i = 0; i < testPayloads.length; i++) {
						const payload = testPayloads[i];

						// Rate limiting
						if (testCount > 0 && testCount % rateLimit === 0) {
							addConsoleLog(
								"info",
								`⏸️ Rate limiting: Waiting 1 second (${testCount} tests completed)`
							);
							await new Promise((resolve) => setTimeout(resolve, 1000));
						}

						try {
							addConsoleLog(
								"info",
								`    🧪 Test ${i + 1}/${testPayloads.length} for ${
									parameter.name
								}: ${
									typeof payload === "object"
										? JSON.stringify(payload)
										: payload
								}`
							);
							const testResult = await executeTest(
								baseUrl,
								endpoint,
								parameter,
								payload
							);

							results.push(testResult);
							setScanResults([...results]);
							testCount++;

							// Log result
							if (testResult.anomaly) {
								addConsoleLog(
									"warning",
									`    ⚠️ Anomaly detected! Status: ${testResult.status}, Time: ${testResult.responseTime}ms, Type: ${testResult.anomalyType}`
								);
							} else {
								addConsoleLog(
									"success",
									`    ✅ Normal response: Status ${testResult.status}, Time: ${testResult.responseTime}ms`
								);
							}

							addConsoleLog(
								"info",
								`📊 Progress: ${testCount}/${totalEstimatedTests} tests completed (${Math.round(
									(testCount / totalEstimatedTests) * 100
								)}%)`
							);
						} catch (error) {
							addConsoleLog(
								"error",
								`❌ Error testing ${endpoint.method} ${endpoint.path} with ${
									parameter.name
								}: ${error instanceof Error ? error.message : "Unknown error"}`
							);
							const errorResult = {
								endpoint: endpoint.path,
								method: endpoint.method,
								payload: payload,
								status: 0,
								responseTime: 0,
								anomaly: true,
								anomalyType: "network_error",
							};
							results.push(errorResult);
							setScanResults([...results]);
							testCount++;
						}

						// Respect concurrency limits
						if (testCount % concurrency === 0) {
							addConsoleLog(
								"info",
								`⏸️ Concurrency control: Brief pause after ${testCount} tests`
							);
							await new Promise((resolve) => setTimeout(resolve, 100));
						}
					}
				}
				addConsoleLog(
					"success",
					`✅ Completed testing endpoint: ${endpoint.method} ${endpoint.path}`
				);
			}

			setFuzzingStatus("success");
			addConsoleLog("success", "🎉 Fuzzing completed successfully!");
			addConsoleLog(
				"info",
				`📊 Final Results Summary: Total tests: ${results.length}, Anomalies: ${
					results.filter((r) => r.anomaly).length
				}, Server errors: ${
					results.filter((r) => r.status >= 500).length
				}, Client errors: ${
					results.filter((r) => r.status >= 400 && r.status < 500).length
				}, Average response time: ${Math.round(
					results.reduce((acc, r) => acc + r.responseTime, 0) / results.length
				)}ms, Unique endpoints tested: ${
					[...new Set(results.map((r) => `${r.method} ${r.endpoint}`))].length
				}`
			);

			// Ensure final results are set
			setScanResults([...results]);
		} catch (error) {
			addConsoleLog(
				"error",
				`❌ Fuzzing process failed: ${
					error instanceof Error
						? error.message
						: "Unknown error occurred during fuzzing"
				}`
			);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unknown error occurred during fuzzing";
			setFuzzingError(errorMessage);
			setFuzzingStatus("error");
			alert(
				`An error occurred during fuzzing: ${errorMessage}\n\nCheck the console for details.`
			);
		} finally {
			setScanning(false);
			addConsoleLog("info", "🏁 Fuzzing process ended");
		}
	};

	// Generate test payloads based on parameter and fuzzing mode
	const generateTestPayloads = (parameter: Parameter, mode: string): any[] => {
		const payloads: any[] = [];

		if (mode === "simple") {
			// Simple mutation payloads
			payloads.push("test_value", "", "null", "undefined", "0", "-1", "999999");
		} else if (mode === "boundary") {
			// Boundary testing payloads
			if (parameter.type === "integer" || parameter.type === "number") {
				payloads.push(
					0,
					-1,
					1,
					2147483647,
					-2147483648,
					2147483648,
					-2147483649,
					"0",
					"-1",
					"999999999999999999999",
					"abc",
					"",
					null
				);
			} else if (parameter.type === "string") {
				payloads.push(
					"",
					"a",
					"A".repeat(100),
					"A".repeat(1000),
					"A".repeat(10000),
					"null",
					"undefined",
					"0",
					"-1",
					null
				);
			}
		} else if (mode === "schema") {
			// Schema-aware testing
			if (parameter.schema) {
				if (parameter.schema.enum) {
					payloads.push(...parameter.schema.enum, "invalid_enum_value");
				}
				if (parameter.schema.minLength !== undefined) {
					payloads.push(
						"a".repeat(Math.max(0, parameter.schema.minLength - 1))
					);
				}
				if (parameter.schema.maxLength !== undefined) {
					payloads.push("a".repeat(parameter.schema.maxLength + 1));
				}
				if (parameter.schema.minimum !== undefined) {
					payloads.push(parameter.schema.minimum - 1);
				}
				if (parameter.schema.maximum !== undefined) {
					payloads.push(parameter.schema.maximum + 1);
				}
			}
		} else if (mode === "aggressive") {
			// Aggressive testing with security payloads
			const securityPayloads = aiSuggestions.map((s) => s.payload);
			payloads.push(...securityPayloads);

			// Add common attack vectors
			payloads.push(
				"' OR '1'='1",
				"<script>alert('XSS')</script>",
				"../../../etc/passwd",
				"; cat /etc/passwd",
				"${7*7}",
				"{{7*7}}",
				"A".repeat(10000),
				"%x%x%x%x",
				"test%00.txt"
			);
		}

		// Always include some basic edge cases
		if (payloads.length === 0) {
			payloads.push("test_value", "", null);
		}

		return payloads;
	};

	// Execute a single test request
	const executeTest = async (
		baseUrl: string,
		endpoint: Endpoint,
		parameter: Parameter,
		payload: any
	): Promise<TestResult> => {
		addConsoleLog(
			"info",
			`🔗 Executing test: ${endpoint.method} ${endpoint.path} | ${
				parameter.name
			}=${typeof payload === "object" ? JSON.stringify(payload) : payload}`
		);

		const startTime = Date.now();
		let url = baseUrl + endpoint.path;
		let requestOptions: RequestInit = {
			method: endpoint.method,
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "FlexGen-API-Fuzzer/1.0",
			},
		};

		addConsoleLog(
			"info",
			`📍 Base URL: ${baseUrl}, Endpoint path: ${endpoint.path}, Final URL: ${url}`
		);
		addConsoleLog(
			"info",
			`🔧 Parameter location: ${parameter.location}, Parameter name: ${parameter.name}`
		);

		// Handle different parameter locations
		if (parameter.location === "path") {
			const originalUrl = url;
			url = url.replace(
				`{${parameter.name}}`,
				encodeURIComponent(String(payload))
			);
			addConsoleLog(
				"info",
				`🛤️ Path parameter replacement: ${originalUrl} → ${url}`
			);
		} else if (parameter.location === "query") {
			const urlObj = new URL(url);
			urlObj.searchParams.set(parameter.name, String(payload));
			url = urlObj.toString();
			addConsoleLog("info", `❓ Query parameter added: ${url}`);
		} else if (parameter.location === "header") {
			requestOptions.headers = {
				...requestOptions.headers,
				[parameter.name]: String(payload),
			};
			addConsoleLog(
				"info",
				`📋 Header added: ${parameter.name}=${String(payload)}`
			);
		} else if (parameter.location === "body") {
			if (endpoint.method !== "GET" && endpoint.method !== "HEAD") {
				const body: any = {};

				body[parameter.name] = payload;
				requestOptions.body = JSON.stringify(body);
				addConsoleLog(
					"info",
					`📦 Body parameter added: ${JSON.stringify(body)}`
				);
			} else {
				addConsoleLog(
					"info",
					`⚠️ Skipping body parameter for ${endpoint.method} request`
				);
			}
		}

		addConsoleLog("info", `🚀 Making request to: ${url}`);
		addConsoleLog(
			"info",
			`📋 Request options: Method: ${
				requestOptions.method
			}, Headers: ${JSON.stringify(requestOptions.headers)}, Body: ${
				requestOptions.body || "none"
			}`
		);

		try {
			const response = await fetch(url, requestOptions);
			const responseTime = Date.now() - startTime;

			addConsoleLog(
				"info",
				`📡 Response received: Status ${response.status}, Time: ${responseTime}ms`
			);

			// Analyze response for anomalies
			const anomaly = detectAnomaly(response, responseTime);
			const anomalyType = getAnomalyType(response, responseTime);

			const result = {
				endpoint: endpoint.path,
				method: endpoint.method,
				payload: payload,
				status: response.status,
				responseTime,
				anomaly,
				anomalyType,
			};

			addConsoleLog(
				"success",
				`✅ Test result: Status ${result.status}, Time: ${
					result.responseTime
				}ms, Anomaly: ${result.anomaly}${
					result.anomalyType ? `, Type: ${result.anomalyType}` : ""
				}`
			);
			return result;
		} catch (error) {
			const responseTime = Date.now() - startTime;
			addConsoleLog(
				"error",
				`❌ Request failed: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);

			const result = {
				endpoint: endpoint.path,
				method: endpoint.method,
				payload: payload,
				status: 0,
				responseTime,
				anomaly: true,
				anomalyType: "network_error",
			};

			addConsoleLog(
				"error",
				`💥 Error result: Status ${result.status}, Time: ${result.responseTime}ms, Anomaly: ${result.anomaly}, Type: ${result.anomalyType}`
			);
			return result;
		}
	};

	// Detect anomalies in responses
	const detectAnomaly = (response: Response, responseTime: number): boolean => {
		// Server errors
		if (response.status >= 500) return true;

		// Slow responses (over 5 seconds)
		if (responseTime > 5000) return true;

		// Unexpected success codes for malicious payloads
		if (response.status === 200 && responseTime < 10) return true;

		return false;
	};

	// Determine anomaly type
	const getAnomalyType = (
		response: Response,
		responseTime: number
	): string | undefined => {
		if (response.status >= 500) return "server_error";
		if (response.status >= 400) return "client_error";
		if (responseTime > 5000) return "slow_response";
		if (response.status === 200 && responseTime < 10)
			return "unexpected_success";
		return undefined;
	};

	return (
		<div className="container mx-auto px-4 py-12">
			{/* Navigation */}
			<div className="mb-6 flex items-center text-sm">
				<Link href="/tools" className="text-blue-600 hover:text-blue-800">
					← Back to Tools
				</Link>
				<span className="mx-2 text-gray-500">/</span>
				<span className="text-gray-700">AI-Powered API Fuzzer</span>
			</div>

			{/* Header */}
			<div className="text-center mb-10">
				<div className="bg-gray-800 text-white py-12 px-6 rounded-lg shadow-lg mb-12">
					<h1 className="text-4xl font-bold mb-3">AI-Powered API Fuzzer</h1>
					<div className="flex justify-center items-center gap-2 mb-4">
						<span className="text-sm font-medium bg-purple-600 text-white px-3 py-1 rounded-full">
							Beta
						</span>
					</div>
					<p className="text-lg max-w-3xl mx-auto">
						Advanced API security testing with intelligent fuzzing strategies
						and AI-powered payload suggestions
					</p>
					<button
						onClick={() => setShowDetails(!showDetails)}
						className="mt-4 text-blue-300 hover:text-blue-100 transition-colors font-medium"
					>
						{showDetails ? "Hide Details" : "Learn More About This Tool"}
					</button>
				</div>
			</div>

			{/* Tool Details */}
			{showDetails && (
				<div className="max-w-4xl mx-auto mb-12 bg-white rounded-lg shadow-md overflow-hidden">
					<div className="bg-gray-50 p-6 border-b border-gray-200">
						<h2 className="text-2xl font-bold text-gray-800">
							About API Fuzzer
						</h2>
						<p className="mt-2 text-gray-600">
							The AI-Powered API Fuzzer helps identify security vulnerabilities
							in REST and GraphQL APIs through intelligent testing strategies.
						</p>
					</div>
					<div className="p-6">
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-semibold mb-3">Key Features</h3>
								<ul className="space-y-2 text-gray-600">
									<li>• Multiple fuzzing strategies</li>
									<li>• AI-powered payload suggestions</li>
									<li>• Configurable parameter scope</li>
									<li>• Rate limiting and safety controls</li>
									<li>• Payload preview and validation</li>
									<li>• Save and reuse fuzzing profiles</li>
								</ul>
							</div>
							<div>
								<h3 className="text-lg font-semibold mb-3">Supported APIs</h3>
								<ul className="space-y-2 text-gray-600">
									<li>• REST APIs (OpenAPI/Swagger)</li>
									<li>• GraphQL endpoints</li>
									<li>• Custom API specifications</li>
									<li>• Authentication-protected APIs</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Tab Navigation */}
			<div className="flex border-b border-gray-200 mb-8">
				{["setup", "preview", "results"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-6 py-3 font-medium capitalize ${
							activeTab === tab
								? "border-b-2 border-blue-500 text-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{tab === "setup"
							? "Configuration"
							: tab === "preview"
							? "Payload Preview"
							: "Results"}
					</button>
				))}
			</div>

			{/* Setup Tab */}
			{activeTab === "setup" && (
				<div className="space-y-8">
					{/* Target URL */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-xl font-bold mb-4">Target Configuration</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									API Base URL or OpenAPI Specification URL
								</label>
								<div className="flex gap-2">
									<input
										type="url"
										value={targetUrl}
										onChange={(e) => setTargetUrl(e.target.value)}
										placeholder="https://api.example.com or https://api.example.com/swagger.json"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<button
										onClick={discoverEndpoints}
										disabled={!targetUrl || isDiscovering}
										className={`px-4 py-2 rounded-md flex items-center font-medium ${
											discoveryStatus === "success"
												? "bg-green-600 text-white hover:bg-green-700"
												: discoveryStatus === "error"
												? "bg-red-600 text-white hover:bg-red-700"
												: discoveryStatus === "loading"
												? "bg-blue-400 text-white cursor-not-allowed"
												: "bg-blue-600 text-white hover:bg-blue-700"
										} disabled:bg-gray-400`}
									>
										{discoveryStatus === "loading" ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Discovering...
											</>
										) : discoveryStatus === "success" ? (
											<>
												<svg
													className="w-4 h-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Discovery Complete
											</>
										) : discoveryStatus === "error" ? (
											<>
												<svg
													className="w-4 h-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
												Retry Discovery
											</>
										) : (
											"Discover Endpoints"
										)}
									</button>
									<button
										onClick={() => {
											clearConsoleLogs();
											addConsoleLog("info", "Console test button clicked!");
											addConsoleLog(
												"info",
												`Time: ${new Date().toLocaleTimeString()}`
											);
											addConsoleLog("info", `URL: ${window.location.href}`);
											addConsoleLog(
												"success",
												"Console logging is working correctly!"
											);
											addConsoleLog(
												"warning",
												"This is a warning message test"
											);
											addConsoleLog("error", "This is an error message test");
										}}
										className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
									>
										🧪 Test Console
									</button>
									<button
										onClick={() => {
											addConsoleLog(
												"info",
												"🧪 Creating test endpoints for debugging..."
											);
											const testEndpoints: Endpoint[] = [
												{
													id: "get-users",
													path: "/users",
													method: "GET",
													summary: "Get all users",
													parameters: [
														{
															name: "page",
															type: "integer",
															required: false,
															location: "query",
															inScope: true,
														},
														{
															name: "limit",
															type: "string",
															required: false,
															location: "query",
															inScope: true,
														},
													],
													selected: true,
												},
												{
													id: "post-users",
													path: "/users",
													method: "POST",
													summary: "Create a user",
													parameters: [
														{
															name: "name",
															type: "string",
															required: true,
															location: "body",
															inScope: true,
														},
														{
															name: "email",
															type: "string",
															required: true,
															location: "body",
															inScope: true,
														},
													],
													selected: true,
												},
												{
													id: "get-user-by-id",
													path: "/users/{id}",
													method: "GET",
													summary: "Get user by ID",
													parameters: [
														{
															name: "id",
															type: "string",
															required: true,
															location: "path",
															inScope: true,
														},
													],
													selected: true,
												},
											];
											setEndpoints(testEndpoints);
											addConsoleLog(
												"success",
												`Created ${testEndpoints.length} test endpoints`
											);
											addConsoleLog(
												"info",
												"Test endpoints are now available for payload preview"
											);
										}}
										className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
									>
										🧪 Create Test Endpoints
									</button>
								</div>
								<div className="mt-2 text-sm text-gray-600">
									<p className="mb-1">
										<strong>Supported formats:</strong> OpenAPI/Swagger
										JSON/YAML specs, or direct API base URLs
									</p>
									<p className="text-yellow-600">
										<strong>Note:</strong> Due to browser CORS restrictions,
										some APIs may not be accessible. For best results, use APIs
										that allow cross-origin requests or provide OpenAPI
										specifications.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Console Logs Display */}
					{consoleLogs.length > 0 && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-xl font-bold">Discovery Logs</h3>
								<button
									onClick={clearConsoleLogs}
									className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
								>
									Clear Logs
								</button>
							</div>
							<div
								className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto"
								ref={consoleLogsRef}
							>
								<div className="space-y-1 font-mono text-sm">
									{consoleLogs.map((log) => (
										<div key={log.id} className="flex items-start space-x-2">
											<span className="text-gray-400 text-xs mt-0.5 min-w-[60px]">
												{log.timestamp}
											</span>
											<span
												className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
													log.type === "error"
														? "bg-red-500"
														: log.type === "warning"
														? "bg-yellow-500"
														: log.type === "success"
														? "bg-green-500"
														: "bg-blue-500"
												}`}
											></span>
											<span
												className={`flex-1 ${
													log.type === "error"
														? "text-red-400"
														: log.type === "warning"
														? "text-yellow-400"
														: log.type === "success"
														? "text-green-400"
														: "text-gray-300"
												}`}
											>
												{log.message}
											</span>
										</div>
									))}
								</div>
							</div>
							<div className="mt-2 text-xs text-gray-500">
								{consoleLogs.length} log entries • Auto-scrolls to latest
							</div>
						</div>
					)}

					{/* Endpoint Selection */}
					{endpoints.length > 0 && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">Endpoint Selection</h3>
							<div className="space-y-3">
								{endpoints.map((endpoint) => (
									<div
										key={endpoint.id}
										className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
									>
										<div className="flex items-center space-x-3">
											<input
												type="checkbox"
												checked={endpoint.selected}
												onChange={(e) => {
													setEndpoints((prev) =>
														prev.map((ep) =>
															ep.id === endpoint.id
																? { ...ep, selected: e.target.checked }
																: ep
														)
													);
												}}
												className="h-4 w-4 text-blue-600"
											/>
											<div>
												<span
													className={`inline-block px-2 py-1 text-xs font-medium rounded ${
														endpoint.method === "GET"
															? "bg-green-100 text-green-800"
															: endpoint.method === "POST"
															? "bg-blue-100 text-blue-800"
															: endpoint.method === "PUT"
															? "bg-yellow-100 text-yellow-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{endpoint.method}
												</span>
												<span className="ml-2 font-medium">
													{endpoint.path}
												</span>
												{endpoint.summary && (
													<span className="ml-2 text-gray-500 text-sm">
														- {endpoint.summary}
													</span>
												)}
											</div>
										</div>
										<div className="text-sm text-gray-500">
											{endpoint.parameters.length} parameters
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Fuzzing Configuration */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Fuzzing Mode */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">Fuzzing Strategy</h3>
							<div className="space-y-3">
								{[
									{
										value: "simple",
										label: "Simple Mutation",
										desc: "Basic value substitution and modification",
									},
									{
										value: "boundary",
										label: "Boundary Testing",
										desc: "Test edge cases and limits",
									},
									{
										value: "schema",
										label: "Schema-Aware",
										desc: "Intelligent testing based on API schema",
									},
									{
										value: "aggressive",
										label: "Aggressive",
										desc: "Comprehensive testing with all techniques",
									},
								].map((mode) => (
									<label
										key={mode.value}
										className="flex items-start space-x-3 cursor-pointer"
									>
										<input
											type="radio"
											name="fuzzingMode"
											value={mode.value}
											checked={fuzzingMode === mode.value}
											onChange={(e) => setFuzzingMode(e.target.value)}
											className="mt-1 h-4 w-4 text-blue-600"
										/>
										<div>
											<div className="font-medium">{mode.label}</div>
											<div className="text-sm text-gray-500">{mode.desc}</div>
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Parameter Scope */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">Parameter Scope</h3>
							<div className="space-y-3">
								{[
									{
										value: "query",
										label: "Query Parameters",
										desc: "URL query string parameters",
									},
									{
										value: "path",
										label: "Path Parameters",
										desc: "URL path variables",
									},
									{
										value: "header",
										label: "Headers",
										desc: "HTTP request headers",
									},
									{
										value: "body",
										label: "Request Body",
										desc: "JSON/form body parameters",
									},
								].map((scope) => (
									<label
										key={scope.value}
										className="flex items-start space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={parameterScope.includes(scope.value)}
											onChange={(e) => {
												if (e.target.checked) {
													setParameterScope((prev) => [...prev, scope.value]);
												} else {
													setParameterScope((prev) =>
														prev.filter((s) => s !== scope.value)
													);
												}
											}}
											className="mt-1 h-4 w-4 text-blue-600"
										/>
										<div>
											<div className="font-medium">{scope.label}</div>
											<div className="text-sm text-gray-500">{scope.desc}</div>
										</div>
									</label>
								))}
							</div>
						</div>
					</div>

					{/* Rate Limiting */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-xl font-bold mb-4">Safety Controls</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Requests per Second
								</label>
								<input
									type="number"
									value={rateLimit}
									onChange={(e) => setRateLimit(parseInt(e.target.value) || 1)}
									min="1"
									max="100"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-sm text-gray-500 mt-1">
									Limit to prevent API overload
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Concurrent Requests
								</label>
								<input
									type="number"
									value={concurrency}
									onChange={(e) =>
										setConcurrency(parseInt(e.target.value) || 1)
									}
									min="1"
									max="20"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-sm text-gray-500 mt-1">
									Number of parallel requests
								</p>
							</div>
						</div>
					</div>

					{/* AI Suggestions */}
					{showAiSuggestions && aiSuggestions.length > 0 && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-xl font-bold mb-4">AI Payload Suggestions</h3>
							<div className="space-y-3">
								{aiSuggestions.map((suggestion) => (
									<div
										key={suggestion.id}
										className="p-3 border border-gray-200 rounded-md"
									>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center space-x-2">
												<span
													className={`px-2 py-1 text-xs font-medium rounded ${
														suggestion.riskLevel === "High"
															? "bg-red-100 text-red-800"
															: suggestion.riskLevel === "Medium"
															? "bg-yellow-100 text-yellow-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{suggestion.riskLevel} Risk
												</span>
												<span className="text-sm font-medium">
													{suggestion.category}
												</span>
											</div>
										</div>
										<div className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
											{suggestion.payload}
										</div>
										<p className="text-sm text-gray-600">
											{suggestion.description}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Profile Management */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-xl font-bold mb-4">Fuzzing Profiles</h3>
						<div className="space-y-4">
							{profiles.length > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Load Existing Profile
									</label>
									<div className="flex gap-2">
										<select
											value={selectedProfile}
											onChange={(e) => setSelectedProfile(e.target.value)}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select a profile...</option>
											{profiles.map((profile) => (
												<option key={profile.id} value={profile.id}>
													{profile.name} -{" "}
													{new Date(profile.createdAt).toLocaleDateString()}
												</option>
											))}
										</select>
										<button
											onClick={() => loadProfile(selectedProfile)}
											disabled={!selectedProfile || profileStatus === "loading"}
											className={`px-4 py-2 rounded-md font-medium ${
												profileStatus === "success"
													? "bg-green-600 text-white hover:bg-green-700"
													: "bg-green-600 text-white hover:bg-green-700"
											} disabled:bg-gray-400`}
										>
											{profileStatus === "loading" ? "Loading..." : "Load"}
										</button>
										<button
											onClick={() => deleteProfile(selectedProfile)}
											disabled={!selectedProfile}
											className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
										>
											Delete
										</button>
									</div>
								</div>
							)}

							<div>
								<button
									onClick={() => setShowProfileModal(true)}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Save Current Configuration
								</button>
							</div>
							{profileError && (
								<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
									<div className="flex">
										<svg
											className="w-5 h-5 text-red-400 mr-2 mt-0.5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div>
											<h4 className="text-sm font-medium text-red-800">
												Profile Operation Failed
											</h4>
											<p className="text-sm text-red-700 mt-1">
												{profileError}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Start Fuzzing */}
					<div className="flex justify-center">
						<button
							onClick={() => {
								generatePreviewPayloads();
								setActiveTab("preview");
							}}
							disabled={endpoints.filter((e) => e.selected).length === 0}
							className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 font-medium"
						>
							Preview Payloads
						</button>
					</div>
				</div>
			)}

			{/* Preview Tab */}
			{activeTab === "preview" && (
				<div className="space-y-6">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-xl font-bold mb-4">Payload Preview</h3>
						<p className="text-gray-600 mb-4">
							Review the test payloads that will be sent to your API endpoints.
							This helps validate that the fuzzing configuration is correct.
						</p>

						{previewPayloads.length > 0 ? (
							<div className="space-y-3">
								{previewPayloads.map((payload, index) => (
									<div
										key={index}
										className="p-4 border border-gray-200 rounded-md"
									>
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium">{payload.endpoint}</span>
											<span className="text-sm text-gray-500">
												{payload.location} parameter
											</span>
										</div>
										<div className="text-sm text-gray-600 mb-2">
											Parameter:{" "}
											<span className="font-mono">{payload.parameter}</span>
										</div>
										<div className="font-mono text-sm bg-gray-100 p-2 rounded">
											{payload.testPayload}
										</div>
										<p className="text-sm text-gray-500 mt-2">
											{payload.description}
										</p>
									</div>
								))}
								{previewPayloads.length >= 10 && (
									<p className="text-sm text-gray-500 text-center">
										Showing first 10 payloads. Total estimated tests:{" "}
										{endpoints
											.filter((e) => e.selected)
											.reduce(
												(acc, e) =>
													acc +
													e.parameters.filter(
														(p) =>
															p.inScope && parameterScope.includes(p.location)
													).length,
												0
											)}
									</p>
								)}
							</div>
						) : (
							<p className="text-gray-500">
								No payloads to preview. Please configure your fuzzing settings
								first.
							</p>
						)}
					</div>

					<div className="flex justify-center space-x-4">
						<button
							onClick={() => setActiveTab("setup")}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
						>
							Back to Configuration
						</button>
						<button
							onClick={() => {
								addConsoleLog("info", "🔍 Payload Preview Debug:");
								addConsoleLog(
									"info",
									`Endpoints discovered: ${endpoints.length}`
								);
								addConsoleLog(
									"info",
									`Selected endpoints: ${
										endpoints.filter((e) => e.selected).length
									}`
								);
								addConsoleLog(
									"info",
									`Parameter scope: [${parameterScope.join(", ")}]`
								);
								addConsoleLog("info", `Fuzzing mode: ${fuzzingMode}`);
								addConsoleLog(
									"info",
									`Preview payloads: ${previewPayloads.length}`
								);

								// Re-generate payloads with logging
								generatePreviewPayloads();
							}}
							className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
						>
							🔍 Debug Preview
						</button>
						<button
							onClick={startFuzzing}
							disabled={
								endpoints.filter((e) => e.selected).length === 0 ||
								fuzzingStatus === "loading"
							}
							className={`px-8 py-3 rounded-md font-medium flex items-center ${
								fuzzingStatus === "success"
									? "bg-green-600 text-white hover:bg-green-700"
									: fuzzingStatus === "error"
									? "bg-red-600 text-white hover:bg-red-700"
									: fuzzingStatus === "loading"
									? "bg-orange-400 text-white cursor-not-allowed"
									: endpoints.filter((e) => e.selected).length === 0
									? "bg-gray-400 text-white cursor-not-allowed"
									: "bg-red-600 text-white hover:bg-red-700"
							}`}
						>
							{fuzzingStatus === "loading" ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Fuzzing in Progress...
								</>
							) : fuzzingStatus === "success" ? (
								<>
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Fuzzing Complete
								</>
							) : fuzzingStatus === "error" ? (
								<>
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
									Retry Fuzzing
								</>
							) : endpoints.filter((e) => e.selected).length === 0 ? (
								"No Endpoints Selected"
							) : (
								"Start Fuzzing"
							)}
						</button>
					</div>
					{previewPayloads.length === 0 &&
						endpoints.filter((e) => e.selected).length > 0 && (
							<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
								<div className="flex">
									<svg
										className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
									<div>
										<h4 className="text-sm font-medium text-yellow-800">
											No Preview Payloads Generated
										</h4>
										<p className="text-sm text-yellow-700 mt-1">
											This might be due to parameter scope settings or endpoint
											configuration. You can still start fuzzing, or use the
											Debug Preview button to investigate.
										</p>
									</div>
								</div>
							</div>
						)}
					{fuzzingError && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<div className="flex">
								<svg
									className="w-5 h-5 text-red-400 mr-2 mt-0.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<h4 className="text-sm font-medium text-red-800">
										Fuzzing Failed
									</h4>
									<p className="text-sm text-red-700 mt-1">{fuzzingError}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Results Tab */}
			{activeTab === "results" && (
				<div className="space-y-6">
					{scanning ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
							<h3 className="text-xl font-semibold mb-2">
								Fuzzing in Progress
							</h3>
							<p className="text-gray-600">
								Testing API endpoints with configured payloads...
							</p>
							<div className="mt-4 text-sm text-gray-500">
								Check the browser console for detailed progress logs
							</div>
						</div>
					) : fuzzingStatus === "error" ? (
						<div className="text-center py-12">
							<div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
								<svg
									className="w-6 h-6 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-red-600">
								Fuzzing Failed
							</h3>
							<p className="text-gray-600 mb-4">
								{fuzzingError || "An error occurred during the fuzzing process"}
							</p>
							<div className="space-y-2">
								<button
									onClick={() => setActiveTab("setup")}
									className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
								>
									Back to Configuration
								</button>
								<button
									onClick={() => {
										setFuzzingStatus("idle");
										setFuzzingError("");
										setScanResults([]);
									}}
									className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
								>
									Reset and Try Again
								</button>
							</div>
						</div>
					) : scanResults.length > 0 ? (
						<div>
							{/* Summary Statistics */}
							<div className="bg-white rounded-lg shadow-md p-6 mb-6">
								<h3 className="text-xl font-bold mb-4">
									Fuzzing Results Summary
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="text-center p-4 bg-blue-50 rounded-lg">
										<div className="text-3xl font-bold text-blue-600">
											{scanResults.length}
										</div>
										<div className="text-sm text-gray-600 font-medium">
											Total Tests
										</div>
									</div>
									<div className="text-center p-4 bg-red-50 rounded-lg">
										<div className="text-3xl font-bold text-red-600">
											{scanResults.filter((r) => r.anomaly).length}
										</div>
										<div className="text-sm text-gray-600 font-medium">
											Anomalies Found
										</div>
									</div>
									<div className="text-center p-4 bg-yellow-50 rounded-lg">
										<div className="text-3xl font-bold text-yellow-600">
											{scanResults.filter((r) => r.status >= 500).length}
										</div>
										<div className="text-sm text-gray-600 font-medium">
											Server Errors
										</div>
									</div>
									<div className="text-center p-4 bg-green-50 rounded-lg">
										<div className="text-3xl font-bold text-green-600">
											{scanResults.length > 0
												? Math.round(
														scanResults.reduce(
															(acc, r) => acc + r.responseTime,
															0
														) / scanResults.length
												  )
												: 0}
											ms
										</div>
										<div className="text-sm text-gray-600 font-medium">
											Avg Response Time
										</div>
									</div>
								</div>

								{/* Additional Statistics */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="text-center p-3 bg-gray-50 rounded">
										<div className="text-xl font-bold text-gray-700">
											{
												scanResults.filter(
													(r) => r.status >= 400 && r.status < 500
												).length
											}
										</div>
										<div className="text-xs text-gray-500">
											Client Errors (4xx)
										</div>
									</div>
									<div className="text-center p-3 bg-gray-50 rounded">
										<div className="text-xl font-bold text-gray-700">
											{
												scanResults.filter(
													(r) => r.status >= 200 && r.status < 300
												).length
											}
										</div>
										<div className="text-xs text-gray-500">Success (2xx)</div>
									</div>
									<div className="text-center p-3 bg-gray-50 rounded">
										<div className="text-xl font-bold text-gray-700">
											{scanResults.filter((r) => r.responseTime > 1000).length}
										</div>
										<div className="text-xs text-gray-500">
											Slow Responses (over 1s)
										</div>
									</div>
									<div className="text-center p-3 bg-gray-50 rounded">
										<div className="text-xl font-bold text-gray-700">
											{
												[
													...new Set(
														scanResults.map((r) => `${r.method} ${r.endpoint}`)
													),
												].length
											}
										</div>
										<div className="text-xs text-gray-500">
											Unique Endpoints
										</div>
									</div>
								</div>

								{/* Risk Assessment */}
								<div className="bg-gradient-to-r from-red-50 to-yellow-50 p-4 rounded-lg border border-red-200">
									<h4 className="font-semibold text-red-800 mb-2">
										Security Risk Assessment
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div>
											<span className="font-medium text-red-700">
												High Risk:
											</span>
											<span className="ml-2 text-red-600">
												{
													scanResults.filter(
														(r) =>
															r.status >= 500 ||
															(r.anomaly && r.anomalyType === "server_error")
													).length
												}{" "}
												issues
											</span>
										</div>
										<div>
											<span className="font-medium text-yellow-700">
												Medium Risk:
											</span>
											<span className="ml-2 text-yellow-600">
												{
													scanResults.filter(
														(r) => r.status >= 400 && r.status < 500
													).length
												}{" "}
												issues
											</span>
										</div>
										<div>
											<span className="font-medium text-blue-700">Info:</span>
											<span className="ml-2 text-blue-600">
												{
													scanResults.filter(
														(r) => r.responseTime > 1000 && !r.anomaly
													).length
												}{" "}
												slow responses
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Charts Section */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
								{/* Anomaly Distribution Chart */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h4 className="text-lg font-semibold mb-4">
										Anomaly Distribution
									</h4>
									<AnomalySummaryChart
										summary={{
											totalEndpoints: [
												...new Set(
													scanResults.map((r) => `${r.method} ${r.endpoint}`)
												),
											].length,
											totalTests: scanResults.length,
											serverErrors: scanResults.filter((r) => r.status >= 500)
												.length,
											clientErrors: scanResults.filter(
												(r) => r.status >= 400 && r.status < 500
											).length,
											slowResponses: scanResults.filter(
												(r) => r.responseTime > 1000
											).length,
											unexpectedResponses: scanResults.filter(
												(r) =>
													r.anomaly && r.anomalyType === "unexpected_success"
											).length,
											completedTests: scanResults.length,
										}}
									/>
								</div>

								{/* Response Time Distribution */}
								<div className="bg-white rounded-lg shadow-md p-6">
									<h4 className="text-lg font-semibold mb-4">
										Response Time Analysis
									</h4>
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">
												Fast ({"<"}100ms)
											</span>
											<div className="flex items-center">
												<div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className="bg-green-500 h-2 rounded-full"
														style={{
															width: `${
																(scanResults.filter((r) => r.responseTime < 100)
																	.length /
																	scanResults.length) *
																100
															}%`,
														}}
													></div>
												</div>
												<span className="text-sm font-medium">
													{
														scanResults.filter((r) => r.responseTime < 100)
															.length
													}
												</span>
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">
												Normal (100ms-1s)
											</span>
											<div className="flex items-center">
												<div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className="bg-blue-500 h-2 rounded-full"
														style={{
															width: `${
																(scanResults.filter(
																	(r) =>
																		r.responseTime >= 100 &&
																		r.responseTime <= 1000
																).length /
																	scanResults.length) *
																100
															}%`,
														}}
													></div>
												</div>
												<span className="text-sm font-medium">
													{
														scanResults.filter(
															(r) =>
																r.responseTime >= 100 && r.responseTime <= 1000
														).length
													}
												</span>
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">
												Slow (over 1s)
											</span>
											<div className="flex items-center">
												<div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className="bg-red-500 h-2 rounded-full"
														style={{
															width: `${
																(scanResults.filter(
																	(r) => r.responseTime > 1000
																).length /
																	scanResults.length) *
																100
															}%`,
														}}
													></div>
												</div>
												<span className="text-sm font-medium">
													{
														scanResults.filter((r) => r.responseTime > 1000)
															.length
													}
												</span>
											</div>
										</div>
									</div>
									<div className="mt-4 p-3 bg-gray-50 rounded">
										<div className="text-xs text-gray-500 mb-1">
											Response Time Statistics
										</div>
										<div className="grid grid-cols-3 gap-2 text-sm">
											<div>
												<span className="font-medium">Min:</span>{" "}
												{Math.min(...scanResults.map((r) => r.responseTime))}ms
											</div>
											<div>
												<span className="font-medium">Max:</span>{" "}
												{Math.max(...scanResults.map((r) => r.responseTime))}ms
											</div>
											<div>
												<span className="font-medium">Median:</span>{" "}
												{(() => {
													const sorted = scanResults
														.map((r) => r.responseTime)
														.sort((a, b) => a - b);
													const mid = Math.floor(sorted.length / 2);
													return sorted.length % 2 !== 0
														? sorted[mid]
														: Math.round((sorted[mid - 1] + sorted[mid]) / 2);
												})()}
												ms
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Endpoint Analysis */}
							<div className="bg-white rounded-lg shadow-md p-6 mb-6">
								<h4 className="text-lg font-semibold mb-4">
									Endpoint Analysis
								</h4>
								<div className="space-y-3">
									{[
										...new Set(
											scanResults.map((r) => `${r.method} ${r.endpoint}`)
										),
									].map((endpoint) => {
										const endpointResults = scanResults.filter(
											(r) => `${r.method} ${r.endpoint}` === endpoint
										);
										const anomalies = endpointResults.filter(
											(r) => r.anomaly
										).length;
										const avgResponseTime = Math.round(
											endpointResults.reduce(
												(acc, r) => acc + r.responseTime,
												0
											) / endpointResults.length
										);

										return (
											<div
												key={endpoint}
												className="p-3 border border-gray-200 rounded-md"
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-medium">{endpoint}</span>
													<div className="flex items-center space-x-2">
														<span className="text-sm text-gray-500">
															{endpointResults.length} tests
														</span>
														{anomalies > 0 && (
															<span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
																{anomalies} anomalies
															</span>
														)}
													</div>
												</div>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
													<div>Avg Time: {avgResponseTime}ms</div>
													<div>
														Success:{" "}
														{
															endpointResults.filter(
																(r) => r.status >= 200 && r.status < 300
															).length
														}
													</div>
													<div>
														4xx Errors:{" "}
														{
															endpointResults.filter(
																(r) => r.status >= 400 && r.status < 500
															).length
														}
													</div>
													<div>
														5xx Errors:{" "}
														{
															endpointResults.filter((r) => r.status >= 500)
																.length
														}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Detailed Results Table */}
							<div className="bg-white rounded-lg shadow-md p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-lg font-semibold">
										Detailed Test Results
									</h4>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => {
												const csvContent =
													"data:text/csv;charset=utf-8," +
													"Endpoint,Method,Payload,Status,Response Time (ms),Anomaly,Anomaly Type\n" +
													scanResults
														.map(
															(r) =>
																`"${r.endpoint}","${r.method}","${
																	typeof r.payload === "object"
																		? JSON.stringify(r.payload).replace(
																				/"/g,
																				'""'
																		  )
																		: String(r.payload).replace(/"/g, '""')
																}",${r.status},${r.responseTime},${
																	r.anomaly
																},"${r.anomalyType || ""}"`
														)
														.join("\n");
												const encodedUri = encodeURI(csvContent);
												const link = document.createElement("a");
												link.setAttribute("href", encodedUri);
												link.setAttribute(
													"download",
													`api-fuzzer-results-${
														new Date().toISOString().split("T")[0]
													}.csv`
												);
												document.body.appendChild(link);
												link.click();
												document.body.removeChild(link);
											}}
											className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
										>
											Export CSV
										</button>
										<button
											onClick={() => {
												const jsonContent =
													"data:text/json;charset=utf-8," +
													encodeURIComponent(
														JSON.stringify(scanResults, null, 2)
													);
												const link = document.createElement("a");
												link.setAttribute("href", jsonContent);
												link.setAttribute(
													"download",
													`api-fuzzer-results-${
														new Date().toISOString().split("T")[0]
													}.json`
												);
												document.body.appendChild(link);
												link.click();
												document.body.removeChild(link);
											}}
											className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
										>
											Export JSON
										</button>
									</div>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Endpoint
												</th>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Method
												</th>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Payload
												</th>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Status
												</th>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Time
												</th>
												<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Anomaly
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{scanResults.slice(0, 50).map((result, index) => (
												<tr
													key={index}
													className={result.anomaly ? "bg-red-50" : ""}
												>
													<td className="px-3 py-2 text-sm text-gray-900">
														{result.endpoint}
													</td>
													<td className="px-3 py-2 text-sm">
														<span
															className={`inline-block px-2 py-1 text-xs font-medium rounded ${
																result.method === "GET"
																	? "bg-green-100 text-green-800"
																	: result.method === "POST"
																	? "bg-blue-100 text-blue-800"
																	: result.method === "PUT"
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-red-100 text-red-800"
															}`}
														>
															{result.method}
														</span>
													</td>
													<td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
														{typeof result.payload === "object"
															? JSON.stringify(result.payload)
															: String(result.payload)}
													</td>
													<td className="px-3 py-2 text-sm">
														<span
															className={`inline-block px-2 py-1 text-xs font-medium rounded ${
																result.status >= 500
																	? "bg-red-100 text-red-800"
																	: result.status >= 400
																	? "bg-yellow-100 text-yellow-800"
																	: result.status >= 200
																	? "bg-green-100 text-green-800"
																	: "bg-gray-100 text-gray-800"
															}`}
														>
															{result.status}
														</span>
													</td>
													<td className="px-3 py-2 text-sm text-gray-900">
														{result.responseTime}ms
													</td>
													<td className="px-3 py-2 text-sm">
														{result.anomaly ? (
															<span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
																{result.anomalyType || "Yes"}
															</span>
														) : (
															<span className="text-gray-400">No</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{scanResults.length > 50 && (
									<div className="mt-4 text-sm text-gray-500 text-center">
										Showing first 50 results out of {scanResults.length} total
										tests
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="text-center py-12">
							<h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
							<p className="text-gray-600">
								Configure your fuzzing settings and start a scan to see results
								here.
							</p>
							<div className="mt-4 space-x-2">
								<button
									onClick={() => setActiveTab("setup")}
									className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Go to Configuration
								</button>
								<button
									onClick={() => {
										addConsoleLog(
											"info",
											"🧪 Creating test results for debugging..."
										);
										const testResults: TestResult[] = [
											{
												endpoint: "/test",
												method: "GET",
												payload: "test_payload",
												status: 200,
												responseTime: 150,
												anomaly: false,
											},
											{
												endpoint: "/test",
												method: "POST",
												payload: "malicious_payload",
												status: 500,
												responseTime: 2000,
												anomaly: true,
												anomalyType: "server_error",
											},
										];
										setScanResults(testResults);
										addConsoleLog(
											"success",
											`Test results created: ${testResults.length} results`
										);
									}}
									className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
								>
									🧪 Test Results Display
								</button>
								<button
									onClick={() => {
										addConsoleLog(
											"info",
											"📊 Creating comprehensive analytics demo..."
										);
										const demoResults: TestResult[] = [
											// Successful responses
											{
												endpoint: "/users",
												method: "GET",
												payload: "normal_request",
												status: 200,
												responseTime: 120,
												anomaly: false,
											},
											{
												endpoint: "/users",
												method: "GET",
												payload: "page=1",
												status: 200,
												responseTime: 95,
												anomaly: false,
											},
											{
												endpoint: "/users",
												method: "GET",
												payload: "limit=10",
												status: 200,
												responseTime: 110,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "GET",
												payload: "category=electronics",
												status: 200,
												responseTime: 85,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "GET",
												payload: "sort=price",
												status: 200,
												responseTime: 140,
												anomaly: false,
											},

											// Client errors (4xx)
											{
												endpoint: "/users/{id}",
												method: "GET",
												payload: "id=999999",
												status: 404,
												responseTime: 45,
												anomaly: false,
											},
											{
												endpoint: "/users",
												method: "POST",
												payload: '{"invalid": "data"}',
												status: 400,
												responseTime: 60,
												anomaly: false,
											},
											{
												endpoint: "/auth/login",
												method: "POST",
												payload: '{"username": "", "password": ""}',
												status: 401,
												responseTime: 80,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "POST",
												payload: "unauthorized_create",
												status: 403,
												responseTime: 55,
												anomaly: false,
											},

											// Server errors (5xx) - High risk
											{
												endpoint: "/users",
												method: "POST",
												payload: "' OR '1'='1",
												status: 500,
												responseTime: 1200,
												anomaly: true,
												anomalyType: "server_error",
											},
											{
												endpoint: "/products/{id}",
												method: "PUT",
												payload: "<script>alert('XSS')</script>",
												status: 500,
												responseTime: 2100,
												anomaly: true,
												anomalyType: "server_error",
											},
											{
												endpoint: "/auth/register",
												method: "POST",
												payload: "../../../etc/passwd",
												status: 500,
												responseTime: 1800,
												anomaly: true,
												anomalyType: "server_error",
											},

											// Slow responses
											{
												endpoint: "/users",
												method: "GET",
												payload: "A".repeat(1000),
												status: 200,
												responseTime: 3200,
												anomaly: true,
												anomalyType: "slow_response",
											},
											{
												endpoint: "/products",
												method: "GET",
												payload: "complex_query",
												status: 200,
												responseTime: 2800,
												anomaly: true,
												anomalyType: "slow_response",
											},

											// Network errors
											{
												endpoint: "/invalid",
												method: "GET",
												payload: "test",
												status: 0,
												responseTime: 0,
												anomaly: true,
												anomalyType: "network_error",
											},

											// More diverse test cases
											{
												endpoint: "/auth/login",
												method: "POST",
												payload: '{"username": "admin", "password": "admin"}',
												status: 200,
												responseTime: 180,
												anomaly: false,
											},
											{
												endpoint: "/users/{id}",
												method: "DELETE",
												payload: "id=1",
												status: 204,
												responseTime: 90,
												anomaly: false,
											},
											{
												endpoint: "/products/{id}",
												method: "GET",
												payload: "id=1",
												status: 200,
												responseTime: 75,
												anomaly: false,
											},
											{
												endpoint: "/health",
												method: "GET",
												payload: "",
												status: 200,
												responseTime: 25,
												anomaly: false,
											},
											{
												endpoint: "/status",
												method: "GET",
												payload: "",
												status: 200,
												responseTime: 30,
												anomaly: false,
											},

											// Additional security test cases
											{
												endpoint: "/users",
												method: "POST",
												payload: '{"$ne": null}',
												status: 400,
												responseTime: 120,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "GET",
												payload: "search=<img src=x onerror=alert(1)>",
												status: 200,
												responseTime: 160,
												anomaly: false,
											},
											{
												endpoint: "/auth/login",
												method: "POST",
												payload:
													"username=admin&password='; DROP TABLE users; --",
												status: 400,
												responseTime: 95,
												anomaly: false,
											},
											{
												endpoint: "/users/{id}",
												method: "GET",
												payload: "id=../../admin",
												status: 400,
												responseTime: 70,
												anomaly: false,
											},

											// Buffer overflow tests
											{
												endpoint: "/users",
												method: "POST",
												payload: "A".repeat(10000),
												status: 413,
												responseTime: 200,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "PUT",
												payload: "B".repeat(5000),
												status: 400,
												responseTime: 150,
												anomaly: false,
											},

											// Format string tests
											{
												endpoint: "/users",
												method: "GET",
												payload: "%x%x%x%x%x",
												status: 200,
												responseTime: 110,
												anomaly: false,
											},
											{
												endpoint: "/products",
												method: "GET",
												payload: "%s%s%s%s",
												status: 200,
												responseTime: 105,
												anomaly: false,
											},

											// Null byte injection
											{
												endpoint: "/files",
												method: "GET",
												payload: "filename=test%00.txt",
												status: 400,
												responseTime: 80,
												anomaly: false,
											},

											// Command injection attempts
											{
												endpoint: "/exec",
												method: "POST",
												payload: "; cat /etc/passwd",
												status: 400,
												responseTime: 90,
												anomaly: false,
											},
											{
												endpoint: "/run",
												method: "POST",
												payload: "| whoami",
												status: 403,
												responseTime: 85,
												anomaly: false,
											},
										];

										setScanResults(demoResults);
										addConsoleLog(
											"success",
											`Analytics demo created: ${demoResults.length} test results with comprehensive data`
										);
										addConsoleLog(
											"info",
											`Results include: ${
												demoResults.filter((r) => r.anomaly).length
											} anomalies, ${
												demoResults.filter((r) => r.status >= 500).length
											} server errors, ${
												demoResults.filter(
													(r) => r.status >= 400 && r.status < 500
												).length
											} client errors`
										);
									}}
									className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
								>
									📊 Show Analytics Demo
								</button>
								<button
									onClick={() => {
										addConsoleLog("info", "🔍 Debug Information:");
										addConsoleLog(
											"info",
											`Endpoints discovered: ${endpoints.length}`
										);
										addConsoleLog(
											"info",
											`Selected endpoints: ${
												endpoints.filter((e) => e.selected).length
											}`
										);
										addConsoleLog("info", `Target URL: ${targetUrl}`);
										addConsoleLog("info", `Fuzzing mode: ${fuzzingMode}`);
										addConsoleLog(
											"info",
											`Parameter scope: [${parameterScope.join(", ")}]`
										);
										addConsoleLog("info", `Fuzzing status: ${fuzzingStatus}`);
										addConsoleLog("info", `Scanning: ${scanning}`);
										addConsoleLog(
											"info",
											`Scan results length: ${scanResults.length}`
										);

										// Log endpoint details
										endpoints.forEach((endpoint, index) => {
											addConsoleLog(
												"info",
												`Endpoint ${index + 1}: ${endpoint.method} ${
													endpoint.path
												} (Selected: ${endpoint.selected}, Parameters: ${
													endpoint.parameters.length
												})`
											);
											endpoint.parameters.forEach((param) => {
												addConsoleLog(
													"info",
													`  - ${param.name} (${param.type}, ${param.location}, In Scope: ${param.inScope})`
												);
											});
										});
									}}
									className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
								>
									🔍 Debug Info
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Profile Save Modal */}
			{showProfileModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-bold mb-4">Save Fuzzing Profile</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Profile Name
								</label>
								<input
									type="text"
									value={newProfileName}
									onChange={(e) => setNewProfileName(e.target.value)}
									placeholder="Enter profile name..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowProfileModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									onClick={saveProfile}
									disabled={
										!newProfileName.trim() || profileStatus === "loading"
									}
									className={`px-4 py-2 rounded-md font-medium flex items-center ${
										profileStatus === "success"
											? "bg-green-600 text-white hover:bg-green-700"
											: profileStatus === "error"
											? "bg-red-600 text-white hover:bg-red-700"
											: profileStatus === "loading"
											? "bg-blue-400 text-white cursor-not-allowed"
											: "bg-blue-600 text-white hover:bg-blue-700"
									} disabled:bg-gray-400`}
								>
									{profileStatus === "loading" ? (
										<>
											<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
											Saving...
										</>
									) : profileStatus === "success" ? (
										<>
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											Saved!
										</>
									) : profileStatus === "error" ? (
										<>
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
											Retry Save
										</>
									) : (
										"Save Profile"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{discoveryError && (
				<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
					<div className="flex">
						<svg
							className="w-5 h-5 text-red-400 mr-2 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h4 className="text-sm font-medium text-red-800">
								Discovery Failed
							</h4>
							<p className="text-sm text-red-700 mt-1">{discoveryError}</p>
						</div>
					</div>
				</div>
			)}
			{discoveryStatusMessage && discoveryStatus === "loading" && (
				<div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
					<div className="flex items-center">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
						<p className="text-sm text-blue-700">{discoveryStatusMessage}</p>
					</div>
				</div>
			)}
			{discoveryStatusMessage && discoveryStatus === "success" && (
				<div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
					<div className="flex items-center">
						<svg
							className="w-4 h-4 text-green-600 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<p className="text-sm text-green-700">{discoveryStatusMessage}</p>
					</div>
				</div>
			)}
		</div>
	);
}
