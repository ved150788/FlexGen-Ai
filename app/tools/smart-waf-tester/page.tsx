"use client";

import { useState, useEffect, useRef } from "react";

// Define types for the scan results
interface TestResult {
	technique: string;
	description: string;
	status: "Success" | "Failed" | "Blocked";
	details: string;
}

interface ScanResults {
	target_url: string;
	scan_time: string;
	results: TestResult[];
	summary: {
		total_tests: number;
		successful_bypasses: number;
		blocked_attempts: number;
		failed_tests: number;
	};
}

export default function SmartWafTesterPage() {
	const [targetUrl, setTargetUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [results, setResults] = useState<ScanResults | null>(null);
	const [expandedSections, setExpandedSections] = useState<string[]>([]);
	const [error, setError] = useState("");
	const [logs, setLogs] = useState<string[]>([]);
	const [progress, setProgress] = useState(0);
	const [scanStage, setScanStage] = useState("");
	const [legalConfirmation, setLegalConfirmation] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [timeoutWarning, setTimeoutWarning] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!legalConfirmation) {
			setError(
				"You must confirm that you have legal authority to test this website."
			);
			return;
		}

		// Basic URL validation
		if (
			!targetUrl.startsWith("http://") &&
			!targetUrl.startsWith("https://") &&
			!targetUrl.startsWith("www")
		) {
			setError("URL must start with http:// or https:// or www.");
			return;
		}

		setIsSubmitting(true);
		setError("");
		setResults(null);
		setLogs([]);
		setProgress(0);
		setScanStage("Initializing WAF test...");
		setIsCancelling(false);
		setTimeoutWarning(false);
		setExpandedSections([]);

		// Create a new AbortController for this request
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;

		// Setup for simulating progress updates and log messages
		let progressInterval: NodeJS.Timeout;
		let currentProgress = 0;
		const scanStages = [
			"Setting up test environment...",
			"Testing SQL injection bypass techniques...",
			"Testing XSS bypass techniques...",
			"Testing HTTP header manipulation...",
			"Testing path traversal bypass methods...",
			"Testing WAF evasion techniques...",
			"Analyzing results...",
		];

		// Set a timeout to show warning for long-running scans
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setTimeoutWarning(true);
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] The test is taking longer than expected. Please be patient or consider cancelling.`,
			]);
		}, 60000); // Show warning after 1 minute

		// Start progress simulation
		progressInterval = setInterval(() => {
			if (isCancelling) {
				clearInterval(progressInterval);
				return;
			}

			if (currentProgress < 95) {
				// Only go up to 95% with the simulation
				currentProgress += 1;
				setProgress(currentProgress);

				// Update scan stage based on progress
				const stageIndex = Math.min(
					Math.floor((currentProgress / 95) * scanStages.length),
					scanStages.length - 1
				);
				setScanStage(scanStages[stageIndex]);

				// Add log messages at certain progress points
				if (
					currentProgress % 15 === 0 ||
					stageIndex !==
						Math.floor(((currentProgress - 1) / 95) * scanStages.length)
				) {
					setLogs((prev) => [
						...prev,
						`[${new Date().toLocaleTimeString()}] ${scanStages[stageIndex]}`,
					]);
				}
			} else {
				clearInterval(progressInterval);
			}
		}, 500);

		try {
			// Log the start of the test
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Starting WAF tests for ${targetUrl}...`,
			]);

			// Make API call to the backend (once we implement the API)
			// For now, create mock data for the beta version
			await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate API delay

			// Clear interval and timeout when response is received
			clearInterval(progressInterval);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			if (isCancelling) {
				setLogs((prev) => [
					...prev,
					`[${new Date().toLocaleTimeString()}] Test cancelled by user.`,
				]);
				setIsSubmitting(false);
				setProgress(0);
				setScanStage("");
				return;
			}

			setProgress(100);
			setScanStage("Test completed");

			// Mock results for beta version
			const mockResults: ScanResults = {
				target_url: targetUrl,
				scan_time: new Date().toISOString(),
				results: [
					{
						technique: "SQL Injection Bypass",
						description: "Attempt to bypass WAF using SQL comment techniques",
						status: Math.random() > 0.5 ? "Success" : "Blocked",
						details:
							"Tested bypasses using SQL comments and encoded characters",
					},
					{
						technique: "XSS Bypass",
						description: "Attempt to bypass WAF using JavaScript encoding",
						status: Math.random() > 0.7 ? "Success" : "Blocked",
						details: "Tested various JavaScript encoding techniques",
					},
					{
						technique: "Path Traversal",
						description: "Testing directory traversal protections",
						status: Math.random() > 0.6 ? "Success" : "Blocked",
						details: "Attempted to access sensitive files using path traversal",
					},
					{
						technique: "HTTP Header Injection",
						description: "Testing HTTP header injection and manipulation",
						status: Math.random() > 0.5 ? "Blocked" : "Success",
						details: "Tested various HTTP header manipulation techniques",
					},
					{
						technique: "User-Agent Spoofing",
						description: "Masking test traffic with different user-agents",
						status: Math.random() > 0.3 ? "Success" : "Blocked",
						details: "Used various user-agent strings to bypass detection",
					},
				],
				summary: {
					total_tests: 5,
					successful_bypasses: 0, // Will be calculated below
					blocked_attempts: 0, // Will be calculated below
					failed_tests: 0,
				},
			};

			// Calculate summary stats
			mockResults.summary.successful_bypasses = mockResults.results.filter(
				(r) => r.status === "Success"
			).length;
			mockResults.summary.blocked_attempts = mockResults.results.filter(
				(r) => r.status === "Blocked"
			).length;

			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Scan completed successfully.`,
			]);
			setResults(mockResults);

			// Auto-expand the summary section
			setExpandedSections(["summary"]);
		} catch (err) {
			clearInterval(progressInterval);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			// Check if this is an abort error (user cancelled)
			if (err instanceof DOMException && err.name === "AbortError") {
				setLogs((prev) => [
					...prev,
					`[${new Date().toLocaleTimeString()}] Test cancelled by user.`,
				]);
			} else {
				setProgress(0);
				setScanStage("");

				// Create a more detailed error message
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to test WAF. Please try again later.";
				setError(`Error during test: ${errorMessage}`);

				setLogs((prev) => [
					...prev,
					`[${new Date().toLocaleTimeString()}] Error: ${errorMessage}`,
				]);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancelScan = () => {
		if (abortControllerRef.current) {
			setIsCancelling(true);
			abortControllerRef.current.abort();
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Cancelling test...`,
			]);
		}
	};

	const toggleSection = (section: string) => {
		setExpandedSections((prev) =>
			prev.includes(section)
				? prev.filter((s) => s !== section)
				: [...prev, section]
		);
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-2">Smart WAF Tester</h1>
				<div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium mb-4">
					Beta
				</div>
				<p className="text-gray-600 max-w-2xl mx-auto">
					Test your web application firewall against common bypass techniques
					and identify potential security weaknesses.
				</p>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="targetUrl"
							className="block text-gray-700 font-medium mb-2"
						>
							Target Website URL
						</label>
						<input
							type="text"
							id="targetUrl"
							value={targetUrl}
							onChange={(e) => setTargetUrl(e.target.value)}
							disabled={isSubmitting}
							placeholder="https://example.com"
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							required
						/>
						<p className="text-sm text-gray-500 mt-1">
							Enter the URL of the website you want to test
						</p>
					</div>

					<div className="mb-6">
						<div className="flex items-center">
							<input
								type="checkbox"
								id="legalConfirmation"
								checked={legalConfirmation}
								onChange={(e) => setLegalConfirmation(e.target.checked)}
								disabled={isSubmitting}
								className="mr-2 h-4 w-4 text-primarySaffron"
								required
							/>
							<label htmlFor="legalConfirmation" className="text-gray-700">
								I confirm I have legal authority to test this website and take
								full responsibility for any consequences of the testing
							</label>
						</div>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
							{error}
						</div>
					)}

					<div className="flex justify-end">
						{isSubmitting ? (
							<button
								type="button"
								onClick={handleCancelScan}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
							>
								Cancel Test
							</button>
						) : (
							<button
								type="submit"
								className="px-4 py-2 bg-primarySaffron text-black rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							>
								Start Testing
							</button>
						)}
					</div>
				</form>
			</div>

			{isSubmitting && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">Test Progress</h2>
					<div className="mb-4">
						<div className="w-full bg-gray-200 rounded-full h-4">
							<div
								className="bg-primarySaffron h-4 rounded-full"
								style={{ width: `${progress}%` }}
							></div>
						</div>
						<div className="flex justify-between mt-2 text-sm text-gray-600">
							<span>{scanStage}</span>
							<span>{progress}%</span>
						</div>
					</div>

					{timeoutWarning && (
						<div className="p-3 mb-4 bg-yellow-100 text-yellow-800 rounded-md">
							The test is taking longer than expected. This may be due to
							complex analysis or network conditions.
						</div>
					)}

					<div className="bg-gray-100 p-4 rounded-md h-48 overflow-y-auto font-mono text-sm">
						{logs.map((log, index) => (
							<div key={index} className="mb-1">
								{log}
							</div>
						))}
					</div>
				</div>
			)}

			{results && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">
						WAF Test Results for {results.target_url}
					</h2>
					<p className="text-sm text-gray-600 mb-4">
						Scan completed on {new Date(results.scan_time).toLocaleString()}
					</p>

					{/* Summary Section */}
					<div className="border border-gray-200 rounded-md mb-4 overflow-hidden">
						<div
							className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
							onClick={() => toggleSection("summary")}
						>
							<h3 className="font-medium">Summary</h3>
							<span>{expandedSections.includes("summary") ? "▼" : "►"}</span>
						</div>
						{expandedSections.includes("summary") && (
							<div className="p-4 border-t border-gray-200">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
									<div className="bg-gray-50 p-4 rounded-md">
										<div className="text-sm text-gray-600">Total Tests</div>
										<div className="text-2xl font-bold">
											{results.summary.total_tests}
										</div>
									</div>
									<div className="bg-red-50 p-4 rounded-md">
										<div className="text-sm text-red-600">
											Successful Bypasses
										</div>
										<div className="text-2xl font-bold text-red-600">
											{results.summary.successful_bypasses}
										</div>
									</div>
									<div className="bg-green-50 p-4 rounded-md">
										<div className="text-sm text-green-600">
											Blocked Attempts
										</div>
										<div className="text-2xl font-bold text-green-600">
											{results.summary.blocked_attempts}
										</div>
									</div>
									<div className="bg-yellow-50 p-4 rounded-md">
										<div className="text-sm text-yellow-600">Failed Tests</div>
										<div className="text-2xl font-bold text-yellow-600">
											{results.summary.failed_tests}
										</div>
									</div>
								</div>
								<div className="bg-gray-50 p-4 rounded-md mb-4">
									<h4 className="font-medium mb-2">Security Assessment</h4>
									<p className="text-gray-700">
										{results.summary.successful_bypasses === 0
											? "Your WAF appears to be effective against all tested bypass techniques. Continue monitoring for new attack vectors."
											: results.summary.successful_bypasses <= 1
											? "Your WAF is mostly effective but has a minor vulnerability. Review the test details to address this issue."
											: "Your WAF has multiple vulnerabilities that should be addressed. Review the detailed results and consider strengthening your protections."}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Detailed Results Section */}
					<div className="border border-gray-200 rounded-md overflow-hidden">
						<div
							className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
							onClick={() => toggleSection("detailed_results")}
						>
							<h3 className="font-medium">Detailed Test Results</h3>
							<span>
								{expandedSections.includes("detailed_results") ? "▼" : "►"}
							</span>
						</div>
						{expandedSections.includes("detailed_results") && (
							<div className="p-4 border-t border-gray-200">
								{results.results.map((result, index) => (
									<div
										key={index}
										className="mb-4 p-4 border rounded-md"
										style={{
											borderColor:
												result.status === "Success"
													? "#ef4444"
													: result.status === "Blocked"
													? "#10b981"
													: "#f59e0b",
											backgroundColor:
												result.status === "Success"
													? "#fee2e2"
													: result.status === "Blocked"
													? "#d1fae5"
													: "#fef3c7",
										}}
									>
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-semibold text-lg">
												{result.technique}
											</h4>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													result.status === "Success"
														? "bg-red-100 text-red-800"
														: result.status === "Blocked"
														? "bg-green-100 text-green-800"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{result.status}
											</span>
										</div>
										<p className="text-gray-700 mb-2">{result.description}</p>
										<div className="text-sm text-gray-600">
											<strong>Details:</strong> {result.details}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			<div className="bg-gray-50 rounded-lg p-6 mt-8">
				<h2 className="text-xl font-semibold mb-4">About Smart WAF Tester</h2>
				<p className="text-gray-600 mb-4">
					The Smart WAF Tester is designed to help security professionals and
					website administrators test the effectiveness of their Web Application
					Firewall (WAF) configurations against common bypass techniques.
				</p>
				<p className="text-gray-600 mb-4">
					<strong>This tool is in BETA.</strong> It provides a simulation of WAF
					testing functionality and will be connected to our backend testing
					engine in future releases.
				</p>
				<div className="bg-yellow-50 p-4 border border-yellow-100 rounded-md">
					<h3 className="font-medium text-yellow-800 mb-2">
						Important Disclaimer
					</h3>
					<p className="text-yellow-700 text-sm">
						Only use this tool on websites you own or have explicit permission
						to test. Unauthorized security testing may be illegal and unethical.
						The tool is provided for educational purposes and legitimate
						security testing only.
					</p>
				</div>
			</div>
		</div>
	);
}
