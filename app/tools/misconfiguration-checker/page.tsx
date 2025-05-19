"use client";

import { useState, useRef } from "react";

export default function MisconfigurationCheckerPage() {
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [urls, setUrls] = useState("");
	const [showDetails, setShowDetails] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);

		const formData = new FormData(e.currentTarget);
		const urlsInput = formData.get("urls") as string;
		const fileInput = formData.get("file") as File;
		const customPort = formData.get("customPort") as string;

		let targetUrls: string[] = [];

		// Process URLs from text input
		if (urlsInput.trim()) {
			targetUrls = urlsInput
				.split("\n")
				.map((url) => url.trim())
				.filter((url) => url.length > 0);
		}

		// Process URLs from file if provided
		if (fileInput && fileInput.size > 0) {
			try {
				const text = await fileInput.text();
				const fileUrls = text
					.split("\n")
					.map((url) => url.trim())
					.filter((url) => url.length > 0);

				targetUrls = [...targetUrls, ...fileUrls];
			} catch (err) {
				setError("Failed to read uploaded file");
				setLoading(false);
				return;
			}
		}

		// Remove duplicates and validate URLs
		targetUrls = [...new Set(targetUrls)];

		if (targetUrls.length === 0) {
			setError("Please provide at least one URL to scan");
			setLoading(false);
			return;
		}

		// Validate URLs
		const invalidUrls = targetUrls.filter((url) => {
			try {
				new URL(url.startsWith("http") ? url : `http://${url}`);
				return false;
			} catch (e) {
				return true;
			}
		});

		if (invalidUrls.length > 0) {
			setError(`The following URLs are invalid: ${invalidUrls.join(", ")}`);
			setLoading(false);
			return;
		}

		try {
			// In a real implementation, this would call the backend
			// For now, we'll simulate a response after a delay
			setTimeout(() => {
				const mockResults = targetUrls.map((url) => {
					// Generate mock results for each URL
					const missingHeaders = [
						"Strict-Transport-Security",
						"Content-Security-Policy",
						"X-Frame-Options",
					]
						.filter(() => Math.random() > 0.5)
						.map((header) => ({
							name: header,
							severity:
								header === "Content-Security-Policy"
									? "Critical"
									: header === "Strict-Transport-Security"
									? "High"
									: "Medium",
						}));

					const weakHeaders = [];
					if (Math.random() > 0.7)
						weakHeaders.push({
							name: "X-XSS-Protection",
							value: "0",
							recommendation: "Use X-XSS-Protection: 1; mode=block",
							severity: "Medium",
						});
					if (Math.random() > 0.7)
						weakHeaders.push({
							name: "Access-Control-Allow-Origin",
							value: "*",
							recommendation:
								"Restrict to specific domains instead of wildcard",
							severity: "High",
						});

					const infoLeakHeaders = [];
					if (Math.random() > 0.6)
						infoLeakHeaders.push({
							name: "Server",
							value: "Apache/2.4.41 (Ubuntu)",
							recommendation: "Remove or anonymize server header",
							severity: "Medium",
						});
					if (Math.random() > 0.8)
						infoLeakHeaders.push({
							name: "X-Powered-By",
							value: "PHP/7.4.3",
							recommendation: "Remove X-Powered-By header",
							severity: "Medium",
						});

					const errorPages = [];
					if (Math.random() > 0.5) {
						errorPages.push({
							code: 404,
							issues: [
								"Reveals server type",
								"Contains default error template",
							],
							evidence: "<h1>404 Not Found</h1><p>nginx/1.18.0 (Ubuntu)</p>",
							recommendation:
								"Implement custom error pages without technical details",
							severity: "Medium",
						});
					}

					if (Math.random() > 0.7) {
						errorPages.push({
							code: 500,
							issues: ["Exposes stack trace", "Shows application path"],
							evidence:
								"Exception in /var/www/html/app/controllers/main.php line 45",
							recommendation:
								"Configure production error handler to hide implementation details",
							severity: "Critical",
						});
					}

					// Count issues by severity
					const criticalCount =
						missingHeaders.filter((h) => h.severity === "Critical").length +
						weakHeaders.filter((h) => h.severity === "Critical").length +
						infoLeakHeaders.filter((h) => h.severity === "Critical").length +
						errorPages.filter((e) => e.severity === "Critical").length;

					const highCount =
						missingHeaders.filter((h) => h.severity === "High").length +
						weakHeaders.filter((h) => h.severity === "High").length +
						infoLeakHeaders.filter((h) => h.severity === "High").length +
						errorPages.filter((e) => e.severity === "High").length;

					const mediumCount =
						missingHeaders.filter((h) => h.severity === "Medium").length +
						weakHeaders.filter((h) => h.severity === "Medium").length +
						infoLeakHeaders.filter((h) => h.severity === "Medium").length +
						errorPages.filter((e) => e.severity === "Medium").length;

					const lowCount =
						missingHeaders.filter((h) => h.severity === "Low").length +
						weakHeaders.filter((h) => h.severity === "Low").length +
						infoLeakHeaders.filter((h) => h.severity === "Low").length +
						errorPages.filter((e) => e.severity === "Low").length;

					const siteIssuesCount =
						missingHeaders.length +
						weakHeaders.length +
						infoLeakHeaders.length +
						errorPages.length;

					return {
						url,
						status: "completed",
						header_issues: {
							missing_headers: missingHeaders,
							weak_headers: weakHeaders,
							info_leak_headers: infoLeakHeaders,
						},
						error_page_issues: errorPages,
						total_issues: siteIssuesCount,
						severity_counts: {
							critical: criticalCount,
							high: highCount,
							medium: mediumCount,
							low: lowCount,
						},
					};
				});

				// Calculate the actual total issues across all URLs
				const totalIssuesCount = mockResults.reduce(
					(sum, result) => sum + result.total_issues,
					0
				);

				// Calculate total severity counts across all URLs
				const totalCritical = mockResults.reduce(
					(sum, result) => sum + result.severity_counts.critical,
					0
				);
				const totalHigh = mockResults.reduce(
					(sum, result) => sum + result.severity_counts.high,
					0
				);
				const totalMedium = mockResults.reduce(
					(sum, result) => sum + result.severity_counts.medium,
					0
				);
				const totalLow = mockResults.reduce(
					(sum, result) => sum + result.severity_counts.low,
					0
				);

				const demoResults = {
					scan_time: new Date().toISOString(),
					total_urls: targetUrls.length,
					total_issues: totalIssuesCount,
					severity_counts: {
						critical: totalCritical,
						high: totalHigh,
						medium: totalMedium,
						low: totalLow,
					},
					results: mockResults,
				};

				setResults(demoResults);
				setLoading(false);
			}, 3000);
		} catch (err) {
			setError("An error occurred while processing your request");
			setLoading(false);
			console.error(err);
		}
	};

	const handleFileChange = () => {
		setError(null);
	};

	const renderResults = () => {
		if (!results) return null;

		return (
			<div className="bg-white rounded-lg shadow-md p-6 mt-8">
				<h2 className="text-2xl font-bold mb-4">Scan Results</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-gray-500 text-sm">Scan Time</p>
						<p className="text-lg font-medium">
							{new Date(results.scan_time).toLocaleString()}
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-gray-500 text-sm">URLs Scanned</p>
						<p className="text-lg font-medium">{results.total_urls}</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-gray-500 text-sm">Total Issues</p>
						<p className="text-lg font-medium">{results.total_issues}</p>
					</div>
				</div>

				{/* Severity breakdown */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold mb-3">Issues by Severity</h3>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-red-50 p-4 rounded-lg border border-red-100">
							<p className="text-red-800 font-medium">Critical</p>
							<p className="text-2xl font-bold text-red-700">
								{results.severity_counts.critical}
							</p>
							<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
								<div
									className="bg-red-600 h-2.5 rounded-full"
									style={{
										width: `${
											results.total_issues
												? (results.severity_counts.critical /
														results.total_issues) *
												  100
												: 0
										}%`,
									}}
								></div>
							</div>
						</div>
						<div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
							<p className="text-orange-800 font-medium">High</p>
							<p className="text-2xl font-bold text-orange-700">
								{results.severity_counts.high}
							</p>
							<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
								<div
									className="bg-orange-500 h-2.5 rounded-full"
									style={{
										width: `${
											results.total_issues
												? (results.severity_counts.high /
														results.total_issues) *
												  100
												: 0
										}%`,
									}}
								></div>
							</div>
						</div>
						<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
							<p className="text-yellow-800 font-medium">Medium</p>
							<p className="text-2xl font-bold text-yellow-700">
								{results.severity_counts.medium}
							</p>
							<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
								<div
									className="bg-yellow-500 h-2.5 rounded-full"
									style={{
										width: `${
											results.total_issues
												? (results.severity_counts.medium /
														results.total_issues) *
												  100
												: 0
										}%`,
									}}
								></div>
							</div>
						</div>
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
							<p className="text-blue-800 font-medium">Low</p>
							<p className="text-2xl font-bold text-blue-700">
								{results.severity_counts.low}
							</p>
							<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
								<div
									className="bg-blue-500 h-2.5 rounded-full"
									style={{
										width: `${
											results.total_issues
												? (results.severity_counts.low / results.total_issues) *
												  100
												: 0
										}%`,
									}}
								></div>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					{results.results.map((result: any, index: number) => (
						<div key={index} className="border rounded-lg overflow-hidden">
							<div className="bg-gray-50 p-4 border-b">
								<h3 className="text-lg font-semibold">{result.url}</h3>
								<div className="flex items-center mt-1">
									<span className="text-sm">
										Status:{" "}
										<span className="font-medium capitalize">
											{result.status}
										</span>
									</span>
									<span className="mx-2">•</span>
									<span className="text-sm">
										Issues:{" "}
										<span className="font-medium">{result.total_issues}</span>
									</span>
								</div>
							</div>

							<div className="p-4">
								{/* Severity summary for this URL */}
								{result.total_issues > 0 && (
									<div className="mb-6">
										<div className="flex items-center space-x-3 mb-2">
											{result.severity_counts.critical > 0 && (
												<div className="flex items-center">
													<span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
													<span className="text-xs text-gray-700">
														{result.severity_counts.critical} Critical
													</span>
												</div>
											)}
											{result.severity_counts.high > 0 && (
												<div className="flex items-center">
													<span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
													<span className="text-xs text-gray-700">
														{result.severity_counts.high} High
													</span>
												</div>
											)}
											{result.severity_counts.medium > 0 && (
												<div className="flex items-center">
													<span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
													<span className="text-xs text-gray-700">
														{result.severity_counts.medium} Medium
													</span>
												</div>
											)}
											{result.severity_counts.low > 0 && (
												<div className="flex items-center">
													<span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
													<span className="text-xs text-gray-700">
														{result.severity_counts.low} Low
													</span>
												</div>
											)}
										</div>
										<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
											{result.severity_counts.critical > 0 && (
												<div
													className="h-full bg-red-500"
													style={{
														width: `${
															(result.severity_counts.critical /
																result.total_issues) *
															100
														}%`,
													}}
												></div>
											)}
											{result.severity_counts.high > 0 && (
												<div
													className="h-full bg-orange-500"
													style={{
														width: `${
															(result.severity_counts.high /
																result.total_issues) *
															100
														}%`,
													}}
												></div>
											)}
											{result.severity_counts.medium > 0 && (
												<div
													className="h-full bg-yellow-500"
													style={{
														width: `${
															(result.severity_counts.medium /
																result.total_issues) *
															100
														}%`,
													}}
												></div>
											)}
											{result.severity_counts.low > 0 && (
												<div
													className="h-full bg-blue-500"
													style={{
														width: `${
															(result.severity_counts.low /
																result.total_issues) *
															100
														}%`,
													}}
												></div>
											)}
										</div>
									</div>
								)}

								{/* Missing Headers */}
								{result.header_issues.missing_headers.length > 0 && (
									<div className="mb-6">
										<h4 className="font-medium text-gray-800 mb-2">
											Missing Security Headers
										</h4>
										<ul className="list-disc pl-5 space-y-1">
											{result.header_issues.missing_headers.map(
												(header: any, i: number) => (
													<li key={i} className="text-sm text-gray-600">
														<div className="flex items-center">
															<span className="font-mono bg-gray-100 px-1 rounded">
																{header.name}
															</span>{" "}
															<span className="ml-2">is missing</span>
															<span
																className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
																	header.severity === "Critical"
																		? "bg-red-100 text-red-800"
																		: header.severity === "High"
																		? "bg-orange-100 text-orange-800"
																		: header.severity === "Medium"
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-blue-100 text-blue-800"
																}`}
															>
																{header.severity}
															</span>
														</div>
														<div className="mt-1 text-xs text-blue-600">
															Recommendation: Implement the {header.name} header
															for enhanced security
														</div>
													</li>
												)
											)}
										</ul>
									</div>
								)}

								{/* Weak Headers */}
								{result.header_issues.weak_headers.length > 0 && (
									<div className="mb-6">
										<h4 className="font-medium text-gray-800 mb-2">
											Insecure Header Values
										</h4>
										<ul className="list-disc pl-5 space-y-2">
											{result.header_issues.weak_headers.map(
												(header: any, i: number) => (
													<li key={i} className="text-sm text-gray-600">
														<div className="flex items-center">
															<span className="font-mono bg-gray-100 px-1 rounded">
																{header.name}: {header.value}
															</span>
															<span
																className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
																	header.severity === "Critical"
																		? "bg-red-100 text-red-800"
																		: header.severity === "High"
																		? "bg-orange-100 text-orange-800"
																		: header.severity === "Medium"
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-blue-100 text-blue-800"
																}`}
															>
																{header.severity}
															</span>
														</div>
														<div className="mt-1 text-xs text-blue-600">
															Recommendation: {header.recommendation}
														</div>
													</li>
												)
											)}
										</ul>
									</div>
								)}

								{/* Information Leakage Headers */}
								{result.header_issues.info_leak_headers.length > 0 && (
									<div className="mb-6">
										<h4 className="font-medium text-gray-800 mb-2">
											Information Disclosure Headers
										</h4>
										<ul className="list-disc pl-5 space-y-2">
											{result.header_issues.info_leak_headers.map(
												(header: any, i: number) => (
													<li key={i} className="text-sm text-gray-600">
														<div className="flex items-center">
															<span className="font-mono bg-gray-100 px-1 rounded">
																{header.name}: {header.value}
															</span>
															<span
																className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
																	header.severity === "Critical"
																		? "bg-red-100 text-red-800"
																		: header.severity === "High"
																		? "bg-orange-100 text-orange-800"
																		: header.severity === "Medium"
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-blue-100 text-blue-800"
																}`}
															>
																{header.severity}
															</span>
														</div>
														<div className="mt-1 text-xs text-blue-600">
															Recommendation: {header.recommendation}
														</div>
													</li>
												)
											)}
										</ul>
									</div>
								)}

								{/* Error Page Issues */}
								{result.error_page_issues.length > 0 && (
									<div>
										<h4 className="font-medium text-gray-800 mb-2">
											Error Page Issues
										</h4>
										<div className="space-y-4">
											{result.error_page_issues.map(
												(errorPage: any, i: number) => (
													<div key={i} className="bg-gray-50 p-3 rounded-lg">
														<div className="flex items-center">
															<p className="text-sm font-medium text-gray-700">
																{errorPage.code} Error Page
															</p>
															<span
																className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
																	errorPage.severity === "Critical"
																		? "bg-red-100 text-red-800"
																		: errorPage.severity === "High"
																		? "bg-orange-100 text-orange-800"
																		: errorPage.severity === "Medium"
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-blue-100 text-blue-800"
																}`}
															>
																{errorPage.severity}
															</span>
														</div>
														<ul className="list-disc pl-5 mt-1 space-y-1">
															{errorPage.issues.map(
																(issue: string, j: number) => (
																	<li key={j} className="text-sm text-gray-600">
																		{issue}
																	</li>
																)
															)}
														</ul>
														<div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
															{errorPage.evidence}
														</div>
														<div className="mt-2 text-xs text-blue-600">
															Recommendation: {errorPage.recommendation}
														</div>
													</div>
												)
											)}
										</div>
									</div>
								)}

								{result.total_issues === 0 && (
									<p className="text-sm text-green-600">
										No issues found for this URL. Good job!
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-3">Misconfiguration Checker</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Identify common misconfigurations in web servers and applications that
					could lead to security vulnerabilities
				</p>
				<button
					onClick={() => setShowDetails(!showDetails)}
					className="mt-4 text-blue-600 hover:text-blue-800 transition-colors font-medium"
				>
					{showDetails ? "Hide Details" : "Learn More About This Tool"}
				</button>
			</div>

			{showDetails && (
				<div className="max-w-4xl mx-auto mb-12 bg-white rounded-lg shadow-md overflow-hidden">
					<div className="bg-gray-50 p-6 border-b border-gray-200">
						<h2 className="text-2xl font-bold text-gray-800">
							About Misconfiguration Checker
						</h2>
						<p className="mt-2 text-gray-600">
							The Misconfiguration Checker is a rule-based tool that detects and
							reports common misconfigurations in web server and application
							deployments that could lead to security vulnerabilities.
						</p>
					</div>

					<div className="p-6">
						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Key Features
							</h3>
							<ul className="space-y-2 list-disc pl-5 text-gray-600">
								<li>
									<span className="font-medium">HTTP Header Analysis:</span>{" "}
									Checks for missing, weak, or revealing HTTP response headers
								</li>
								<li>
									<span className="font-medium">Error Page Evaluation:</span>{" "}
									Tests error pages for information disclosure and stack traces
								</li>
								<li>
									<span className="font-medium">Bulk URL Testing:</span> Scan
									multiple endpoints simultaneously via text input or file
									upload
								</li>
								<li>
									<span className="font-medium">Custom Port Support:</span> Test
									services running on non-standard ports
								</li>
								<li>
									<span className="font-medium">Detailed Remediation:</span>{" "}
									Provides specific guidance on fixing identified issues
								</li>
							</ul>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								What We Check
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Security Headers
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Strict-Transport-Security (HSTS)</li>
										<li>• Content-Security-Policy (CSP)</li>
										<li>• X-Frame-Options</li>
										<li>• X-XSS-Protection</li>
										<li>• X-Content-Type-Options</li>
										<li>• Referrer-Policy</li>
										<li>• Access-Control-Allow-Origin (CORS)</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Information Leakage
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Server header details</li>
										<li>• X-Powered-By header</li>
										<li>• Stack traces in error pages</li>
										<li>• Path disclosure</li>
										<li>• Default server error pages</li>
										<li>• Email addresses or comments</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Error Pages</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• 404 Not Found</li>
										<li>• 403 Forbidden</li>
										<li>• 500 Internal Server Error</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Security Best Practices
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• TLS/SSL implementation</li>
										<li>• Cookie security attributes</li>
										<li>• HTTP to HTTPS redirects</li>
										<li>• CORS configuration</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Categories of Misconfigurations
							</h3>
							<div className="space-y-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Critical</h4>
									<p className="text-sm text-gray-600 mt-1">
										Issues that represent an immediate security threat and
										should be addressed urgently.
									</p>
									<ul className="mt-2 text-sm space-y-1 list-disc pl-5">
										<li>
											Missing Content-Security-Policy with unrestricted scripts
										</li>
										<li>Exposed admin interfaces without authentication</li>
										<li>Clear-text transmission of sensitive data</li>
										<li>Outdated TLS/SSL versions (SSLv3, TLS 1.0)</li>
										<li>
											Exposed stack traces revealing application paths and logic
										</li>
									</ul>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">High</h4>
									<p className="text-sm text-gray-600 mt-1">
										Issues that pose significant security risks and should be
										addressed promptly.
									</p>
									<ul className="mt-2 text-sm space-y-1 list-disc pl-5">
										<li>Missing HSTS header on HTTPS sites</li>
										<li>
											Wildcard CORS configurations (Access-Control-Allow-Origin:
											*)
										</li>
										<li>Cookies without Secure or HttpOnly flags</li>
										<li>Weak cipher suites in SSL/TLS configuration</li>
										<li>
											Missing X-Frame-Options enabling clickjacking attacks
										</li>
									</ul>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Medium</h4>
									<p className="text-sm text-gray-600 mt-1">
										Issues that represent potential security weaknesses that
										should be addressed.
									</p>
									<ul className="mt-2 text-sm space-y-1 list-disc pl-5">
										<li>
											Information disclosure via Server and X-Powered-By headers
										</li>
										<li>Missing or weak Referrer-Policy header</li>
										<li>
											Insecure default error pages revealing technology details
										</li>
										<li>Missing X-Content-Type-Options header</li>
										<li>Missing subresource integrity for external scripts</li>
									</ul>
								</div>

								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Low</h4>
									<p className="text-sm text-gray-600 mt-1">
										Issues that represent best practice violations with minimal
										direct security impact.
									</p>
									<ul className="mt-2 text-sm space-y-1 list-disc pl-5">
										<li>Missing Feature-Policy/Permissions-Policy headers</li>
										<li>Overly informative HTTP response codes</li>
										<li>Cacheable HTTPS responses containing sensitive data</li>
										<li>Missing security.txt or robots.txt files</li>
										<li>Unnecessary HTTP methods enabled (OPTIONS, TRACE)</li>
									</ul>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Recommendations
							</h3>
							<div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
								<ul className="space-y-2 list-disc pl-5">
									<li>
										Run this tool against both development and production
										environments
									</li>
									<li>
										Check all public-facing endpoints that your organization
										maintains
									</li>
									<li>
										Schedule regular scans to ensure ongoing compliance with
										security best practices
									</li>
									<li>
										Use remediation guidance to improve your security posture
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="urls"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Target URLs (one per line)
						</label>
						<textarea
							id="urls"
							name="urls"
							value={urls}
							onChange={(e) => setUrls(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md h-32"
							placeholder="https://example.com&#10;https://api.example.com&#10;https://admin.example.com"
						></textarea>
					</div>

					<div>
						<label
							htmlFor="file"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Or Upload URL List (Text File)
						</label>
						<input
							type="file"
							id="file"
							name="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="w-full p-2 border border-gray-300 rounded-md"
							accept=".txt,.csv,.json"
						/>
						<p className="mt-1.5 text-xs text-gray-500">
							Accepts .txt files with one URL per line
						</p>
					</div>

					<div>
						<label
							htmlFor="customPort"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Custom Port (Optional)
						</label>
						<input
							type="text"
							id="customPort"
							name="customPort"
							placeholder="8080"
							className="w-full p-2 border border-gray-300 rounded-md"
						/>
						<p className="mt-1.5 text-xs text-gray-500">
							If your service runs on a non-standard port (e.g., 8080, 8443)
						</p>
					</div>

					{error && (
						<div className="bg-red-50 border-l-4 border-red-500 p-4">
							<p className="text-red-700">{error}</p>
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-black transition-colors disabled:opacity-50"
					>
						{loading ? "Running Scan..." : "Scan for Misconfigurations"}
					</button>
				</form>
			</div>

			{loading && (
				<div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-600">Scanning for misconfigurations...</p>
					<p className="text-gray-500 text-sm mt-2">
						This may take a few moments depending on the number of URLs
					</p>
				</div>
			)}

			{renderResults()}
		</div>
	);
}
