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
}

interface Endpoint {
	path: string;
	method: string;
	summary?: string;
	parameters: Parameter[];
	requestBody?: any;
	responses?: any;
}

interface ApiEndpoint {
	url: string;
	method: string;
	description: string;
	parameters: string[];
	authRequired: boolean;
	vulnerabilities: {
		id: string;
		name: string;
		severity: "Critical" | "High" | "Medium" | "Low";
		description: string;
		cwe: string;
		recommendation: string;
		evidence: string;
	}[];
}

interface TestResult {
	endpoint: string;
	method: string;
	payload: any;
	status: number;
	responseTime: number;
	response: any;
	anomaly: boolean;
	anomalyType?:
		| "server_error"
		| "client_error"
		| "slow_response"
		| "unexpected_response";
	testCase: string;
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
	const [targetUrl, setTargetUrl] = useState("");
	const [scanning, setScanning] = useState(false);
	const [scanComplete, setScanComplete] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
	const [stats, setStats] = useState({
		endpointsDiscovered: 0,
		vulnerabilitiesFound: 0,
		criticalIssues: 0,
		highIssues: 0,
		mediumIssues: 0,
		lowIssues: 0,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!targetUrl) {
			alert("Please enter a target URL");
			return;
		}

		setScanning(true);
		setScanComplete(false);
		setEndpoints([]);

		// Simulate API scanning process
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Generate mock results based on the target URL
		const parsedUrl = new URL(
			targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`
		);
		const hostname = parsedUrl.hostname;
		const baseUrl = `${parsedUrl.protocol}//${hostname}`;

		const mockEndpoints: ApiEndpoint[] = [
			{
				url: `${baseUrl}/api/users`,
				method: "GET",
				description: "User listing endpoint",
				parameters: ["page", "limit", "sort"],
				authRequired: true,
				vulnerabilities: [
					{
						id: "api-001",
						name: "SQL Injection in sort parameter",
						severity: "Critical",
						description: `The sort parameter is vulnerable to SQL injection attacks, allowing attackers to extract data from the database.`,
						cwe: "CWE-89",
						recommendation:
							"Implement parameterized queries and input validation for sort parameter",
						evidence:
							"Request with sort=name')) UNION SELECT username,password FROM users-- returned database content",
					},
				],
			},
			{
				url: `${baseUrl}/api/products`,
				method: "GET",
				description: "Product listing endpoint",
				parameters: ["category", "price", "search"],
				authRequired: false,
				vulnerabilities: [
					{
						id: "api-002",
						name: "Excessive Data Exposure",
						severity: "Medium",
						description: `The endpoint returns sensitive product information like cost price and supplier details to unauthenticated users.`,
						cwe: "CWE-213",
						recommendation:
							"Implement proper data filtering based on user roles",
						evidence:
							"Response includes internal fields: supplier_id, cost_price, margin",
					},
				],
			},
			{
				url: `${baseUrl}/graphql`,
				method: "POST",
				description: "GraphQL API endpoint",
				parameters: ["query", "variables"],
				authRequired: true,
				vulnerabilities: [
					{
						id: "api-003",
						name: "GraphQL Introspection Enabled",
						severity: "High",
						description: `GraphQL introspection is enabled, allowing attackers to discover the complete API schema.`,
						cwe: "CWE-668",
						recommendation:
							"Disable GraphQL introspection in production environments",
						evidence:
							"Introspection query returned full schema details including private mutations",
					},
				],
			},
			{
				url: `${baseUrl}/api/auth/login`,
				method: "POST",
				description: "Authentication endpoint",
				parameters: ["username", "password"],
				authRequired: false,
				vulnerabilities: [
					{
						id: "api-004",
						name: "Lack of Rate Limiting",
						severity: "High",
						description: `The login endpoint does not implement rate limiting, making it vulnerable to brute force attacks.`,
						cwe: "CWE-307",
						recommendation:
							"Implement rate limiting and account lockout mechanisms",
						evidence:
							"Successfully sent 100 login attempts in 10 seconds without restrictions",
					},
				],
			},
			{
				url: `${baseUrl}/api/upload`,
				method: "POST",
				description: "File upload endpoint",
				parameters: ["file"],
				authRequired: true,
				vulnerabilities: [
					{
						id: "api-005",
						name: "Insufficient File Type Validation",
						severity: "Critical",
						description: `The file upload endpoint allows uploading executable files that could be used for remote code execution.`,
						cwe: "CWE-434",
						recommendation:
							"Implement strict file type validation and content verification",
						evidence:
							"Successfully uploaded file.php with PHP code that was executed on the server",
					},
				],
			},
		];

		setEndpoints(mockEndpoints);

		// Calculate statistics
		const vulnerabilities = mockEndpoints.flatMap(
			(endpoint) => endpoint.vulnerabilities
		);
		const criticalIssues = vulnerabilities.filter(
			(v) => v.severity === "Critical"
		).length;
		const highIssues = vulnerabilities.filter(
			(v) => v.severity === "High"
		).length;
		const mediumIssues = vulnerabilities.filter(
			(v) => v.severity === "Medium"
		).length;
		const lowIssues = vulnerabilities.filter(
			(v) => v.severity === "Low"
		).length;

		setStats({
			endpointsDiscovered: mockEndpoints.length,
			vulnerabilitiesFound: vulnerabilities.length,
			criticalIssues,
			highIssues,
			mediumIssues,
			lowIssues,
		});

		setScanning(false);
		setScanComplete(true);
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-3">API Fuzzer</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Discover and test API endpoints for common vulnerabilities including
					injection flaws, broken authentication, and security misconfigurations
				</p>
				<button
					onClick={() => setShowDetails(!showDetails)}
					className="mt-4 text-blue-600 hover:text-blue-800 transition-colors font-medium"
				>
					{showDetails ? "Hide Details" : "Learn More About This Tool"}
				</button>
			</div>

			{/* Tool description details */}
			{showDetails && (
				<div className="max-w-4xl mx-auto mb-12 bg-white rounded-lg shadow-md overflow-hidden">
					<div className="bg-gray-50 p-6 border-b border-gray-200">
						<h2 className="text-2xl font-bold text-gray-800">
							About API Fuzzer
						</h2>
						<p className="mt-2 text-gray-600">
							The API Fuzzer automatically discovers and tests API endpoints for
							security vulnerabilities using intelligent fuzzing techniques to
							identify potential attack vectors.
						</p>
					</div>

					<div className="p-6">
						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Key Features
							</h3>
							<ul className="space-y-2 list-disc pl-5 text-gray-600">
								<li>
									<span className="font-medium">API Discovery:</span>{" "}
									Automatically identifies API endpoints including REST,
									GraphQL, and SOAP services
								</li>
								<li>
									<span className="font-medium">Authentication Testing:</span>{" "}
									Detects weak authentication mechanisms and broken access
									controls
								</li>
								<li>
									<span className="font-medium">Injection Testing:</span> Tests
									for SQL, NoSQL, command injection, and other injection
									vulnerabilities
								</li>
								<li>
									<span className="font-medium">Parameter Fuzzing:</span>{" "}
									Intelligently fuzzes API parameters to identify unexpected
									behaviors
								</li>
								<li>
									<span className="font-medium">Schema Analysis:</span>{" "}
									Validates responses against expected schemas to find data
									leakage issues
								</li>
								<li>
									<span className="font-medium">GraphQL Security:</span>{" "}
									Specialized testing for GraphQL-specific vulnerabilities
								</li>
							</ul>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Vulnerability Types Detected
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Injection Flaws</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• SQL Injection</li>
										<li>• NoSQL Injection</li>
										<li>• Command Injection</li>
										<li>• GraphQL Injection</li>
										<li>• XML Injection (XXE)</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Authentication Issues
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Missing Authentication</li>
										<li>• JWT Weaknesses</li>
										<li>• OAuth Misconfigurations</li>
										<li>• Weak Credentials</li>
										<li>• Session Management Flaws</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Access Control</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Broken Object Level Authorization</li>
										<li>• Insecure Direct Object References</li>
										<li>• Missing Function-Level Access Control</li>
										<li>• Horizontal/Vertical Privilege Escalation</li>
										<li>• CORS Misconfigurations</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Other Vulnerabilities
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Excessive Data Exposure</li>
										<li>• Mass Assignment</li>
										<li>• Rate Limiting Issues</li>
										<li>• Improper Error Handling</li>
										<li>• Security Misconfiguration</li>
									</ul>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								How It Works
							</h3>
							<ol className="space-y-3 list-decimal pl-5 text-gray-600">
								<li>
									<span className="font-medium">Endpoint Discovery</span> -
									Crawls the application to find API endpoints and determines
									parameter types
								</li>
								<li>
									<span className="font-medium">Authentication Analysis</span> -
									Tests authentication mechanisms and attempts to bypass access
									controls
								</li>
								<li>
									<span className="font-medium">Parameter Fuzzing</span> - Sends
									various payloads to parameters to identify potential
									vulnerabilities
								</li>
								<li>
									<span className="font-medium">Response Analysis</span> -
									Analyzes responses for indicators of vulnerabilities or
									information disclosure
								</li>
								<li>
									<span className="font-medium">
										Vulnerability Verification
									</span>{" "}
									- Confirms potential issues with targeted tests to reduce
									false positives
								</li>
							</ol>
							<div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
								<p>
									<span className="font-medium">Pro Tip:</span> For
									comprehensive API security testing, combine API Fuzzer with
									other FlexGen security tools such as the Misconfiguration
									Checker for a complete assessment of your API security
									posture.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="targetUrl"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Target API URL
						</label>
						<div className="flex">
							<input
								type="text"
								id="targetUrl"
								value={targetUrl}
								onChange={(e) => setTargetUrl(e.target.value)}
								placeholder="https://api.example.com"
								className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								disabled={scanning}
							/>
							<button
								type="submit"
								className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-black transition-colors disabled:opacity-50"
								disabled={scanning}
							>
								{scanning ? "Scanning..." : "Scan API"}
							</button>
						</div>
						<p className="mt-1.5 text-xs text-gray-500">
							Enter the root URL of the API you want to test (e.g.,
							https://example.com/api)
						</p>
					</div>

					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="font-medium text-gray-800 mb-2">Scan Options</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="authTesting"
									className="mr-2"
									defaultChecked
								/>
								<label htmlFor="authTesting" className="text-sm text-gray-700">
									Authentication Testing
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="injectionTesting"
									className="mr-2"
									defaultChecked
								/>
								<label
									htmlFor="injectionTesting"
									className="text-sm text-gray-700"
								>
									Injection Testing
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="graphqlTesting"
									className="mr-2"
									defaultChecked
								/>
								<label
									htmlFor="graphqlTesting"
									className="text-sm text-gray-700"
								>
									GraphQL Testing
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="paramFuzzing"
									className="mr-2"
									defaultChecked
								/>
								<label htmlFor="paramFuzzing" className="text-sm text-gray-700">
									Parameter Fuzzing
								</label>
							</div>
						</div>
					</div>
				</form>
			</div>

			{/* Scan progress indicator */}
			{scanning && (
				<div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-600">Scanning API endpoints...</p>
					<div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
						<div className="bg-blue-600 h-2.5 rounded-full w-2/3"></div>
					</div>
					<p className="text-gray-500 text-sm mt-2">
						Discovering and testing endpoints for vulnerabilities
					</p>
				</div>
			)}

			{/* Scan results */}
			{scanComplete && (
				<div className="max-w-4xl mx-auto mt-8">
					{/* Summary statistics */}
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<h2 className="text-xl font-semibold mb-4">Scan Results Summary</h2>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="bg-gray-50 p-4 rounded-lg text-center">
								<p className="text-sm text-gray-500">Endpoints</p>
								<p className="text-2xl font-bold text-gray-800">
									{stats.endpointsDiscovered}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg text-center">
								<p className="text-sm text-gray-500">Vulnerabilities</p>
								<p className="text-2xl font-bold text-gray-800">
									{stats.vulnerabilitiesFound}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg text-center">
								<p className="text-sm text-gray-500">Critical Issues</p>
								<p className="text-2xl font-bold text-red-600">
									{stats.criticalIssues}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg text-center">
								<p className="text-sm text-gray-500">High Issues</p>
								<p className="text-2xl font-bold text-orange-500">
									{stats.highIssues}
								</p>
							</div>
						</div>

						{/* Severity distribution */}
						<h3 className="font-medium text-gray-800 mb-2">
							Severity Distribution
						</h3>
						<div className="h-4 flex rounded-full overflow-hidden mb-4">
							{stats.criticalIssues > 0 && (
								<div
									className="bg-red-500 h-full"
									style={{
										width: `${
											(stats.criticalIssues / stats.vulnerabilitiesFound) * 100
										}%`,
									}}
								></div>
							)}
							{stats.highIssues > 0 && (
								<div
									className="bg-orange-500 h-full"
									style={{
										width: `${
											(stats.highIssues / stats.vulnerabilitiesFound) * 100
										}%`,
									}}
								></div>
							)}
							{stats.mediumIssues > 0 && (
								<div
									className="bg-yellow-500 h-full"
									style={{
										width: `${
											(stats.mediumIssues / stats.vulnerabilitiesFound) * 100
										}%`,
									}}
								></div>
							)}
							{stats.lowIssues > 0 && (
								<div
									className="bg-blue-500 h-full"
									style={{
										width: `${
											(stats.lowIssues / stats.vulnerabilitiesFound) * 100
										}%`,
									}}
								></div>
							)}
						</div>
						<div className="flex text-xs text-gray-500 justify-between">
							<div className="flex items-center">
								<span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span>
								<span>Critical ({stats.criticalIssues})</span>
							</div>
							<div className="flex items-center">
								<span className="w-3 h-3 inline-block bg-orange-500 rounded-full mr-1"></span>
								<span>High ({stats.highIssues})</span>
							</div>
							<div className="flex items-center">
								<span className="w-3 h-3 inline-block bg-yellow-500 rounded-full mr-1"></span>
								<span>Medium ({stats.mediumIssues})</span>
							</div>
							<div className="flex items-center">
								<span className="w-3 h-3 inline-block bg-blue-500 rounded-full mr-1"></span>
								<span>Low ({stats.lowIssues})</span>
							</div>
						</div>
					</div>

					{/* Detailed findings by endpoint */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold mb-4">
							API Endpoint Analysis
						</h2>

						<div className="space-y-6">
							{endpoints.map((endpoint, index) => (
								<div key={index} className="border rounded-lg overflow-hidden">
									<div className="bg-gray-50 p-4 border-b">
										<div className="flex flex-wrap justify-between items-center">
											<div>
												<span className="px-2 py-1 text-xs font-medium bg-gray-200 rounded-full mr-2">
													{endpoint.method}
												</span>
												<span className="font-medium">{endpoint.url}</span>
											</div>
											<span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
												{endpoint.vulnerabilities.length}{" "}
												{endpoint.vulnerabilities.length === 1
													? "Issue"
													: "Issues"}
											</span>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											{endpoint.description}
										</p>
									</div>

									<div className="p-4">
										<div className="mb-3">
											<span className="text-xs font-medium text-gray-500">
												Parameters:{" "}
											</span>
											{endpoint.parameters.map((param, pIndex) => (
												<span
													key={pIndex}
													className="text-xs bg-gray-100 px-2 py-1 rounded mr-1"
												>
													{param}
												</span>
											))}
										</div>

										<div className="mb-3">
											<span className="text-xs font-medium text-gray-500">
												Authentication:{" "}
											</span>
											<span
												className={`text-xs px-2 py-1 rounded ${
													endpoint.authRequired
														? "bg-green-100 text-green-800"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{endpoint.authRequired ? "Required" : "Not Required"}
											</span>
										</div>

										<h4 className="font-medium text-gray-800 mb-2">
											Vulnerabilities:
										</h4>
										<div className="space-y-4">
											{endpoint.vulnerabilities.map(
												(
													vuln: {
														id: string;
														name: string;
														severity: "Critical" | "High" | "Medium" | "Low";
														description: string;
														cwe: string;
														recommendation: string;
														evidence: string;
													},
													vIndex: number
												) => (
													<div
														key={vIndex}
														className={`border-l-4 p-3 ${
															vuln.severity === "Critical"
																? "border-red-500 bg-red-50"
																: vuln.severity === "High"
																? "border-orange-500 bg-orange-50"
																: vuln.severity === "Medium"
																? "border-yellow-500 bg-yellow-50"
																: "border-blue-500 bg-blue-50"
														}`}
													>
														<div className="flex justify-between">
															<h5 className="font-medium">{vuln.name}</h5>
															<span
																className={`text-xs px-2 py-0.5 rounded-full ${
																	vuln.severity === "Critical"
																		? "bg-red-200 text-red-800"
																		: vuln.severity === "High"
																		? "bg-orange-200 text-orange-800"
																		: vuln.severity === "Medium"
																		? "bg-yellow-200 text-yellow-800"
																		: "bg-blue-200 text-blue-800"
																}`}
															>
																{vuln.severity}
															</span>
														</div>
														<p className="text-sm mt-1">{vuln.description}</p>
														<div className="mt-2 text-sm">
															<p>
																<span className="font-medium">CWE:</span>{" "}
																{vuln.cwe}
															</p>
															<p className="mt-1">
																<span className="font-medium">Evidence:</span>{" "}
																{vuln.evidence}
															</p>
															<p className="mt-2 text-gray-700">
																<span className="font-medium">
																	Recommendation:
																</span>{" "}
																{vuln.recommendation}
															</p>
														</div>
													</div>
												)
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="mt-6 flex justify-between">
							<button
								onClick={() => window.print()}
								className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
									/>
								</svg>
								Print Report
							</button>
							<button
								onClick={() =>
									alert("Export functionality would be implemented here")
								}
								className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black transition-colors text-sm flex items-center"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								Export Findings
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
