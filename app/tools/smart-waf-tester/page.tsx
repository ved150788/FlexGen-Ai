"use client";

import { useState, useEffect, useRef } from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	PointElement,
	LineElement,
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
	Title,
	PointElement,
	LineElement
);

// Define types for the scan results
interface TestResult {
	technique: string;
	description: string;
	status: "Success" | "Failed" | "Blocked";
	details: string;
	category: string;
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
		bypass_by_category?: Record<string, number>;
		categories?: string[];
	};
}

// Chart components for visualizing the results
const ResultsBreakdownChart = ({ summary }: { summary: any }) => {
	if (!summary) return null;

	const data = {
		labels: ["Successful Bypasses", "Blocked Attempts", "Failed Tests"],
		datasets: [
			{
				label: "Test Results",
				data: [
					summary.successful_bypasses || 0,
					summary.blocked_attempts || 0,
					summary.failed_tests || 0,
				],
				backgroundColor: [
					"rgba(220, 38, 38, 0.7)", // red-600 with opacity
					"rgba(16, 185, 129, 0.7)", // emerald-500 with opacity
					"rgba(245, 158, 11, 0.7)", // amber-500 with opacity
				],
				borderColor: [
					"rgb(220, 38, 38)",
					"rgb(16, 185, 129)",
					"rgb(245, 158, 11)",
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
				text: "Test Results Distribution",
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

const CategoryBypassChart = ({ summary }: { summary: any }) => {
	if (!summary || !summary.categories || !summary.bypass_by_category)
		return null;

	const data = {
		labels: summary.categories,
		datasets: [
			{
				label: "Successful Bypasses by Category",
				data: summary.categories.map(
					(cat: string) => summary.bypass_by_category[cat] || 0
				),
				backgroundColor: "rgba(37, 99, 235, 0.6)", // blue-600
				borderColor: "rgb(37, 99, 235)",
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			title: {
				display: true,
				text: "Bypasses by Attack Category",
				color: "#1e3a8a", // blue-900
				font: {
					size: 16,
				},
			},
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					precision: 0,
				},
			},
		},
	};

	return (
		<div className="h-64">
			<Bar data={data} options={options} />
		</div>
	);
};

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
		let processedUrl = targetUrl;
		if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
			processedUrl = "https://" + targetUrl;
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
				`[${new Date().toLocaleTimeString()}] Starting WAF tests for ${processedUrl}...`,
			]);

			// Make API call to the backend
			const response = await fetch("/api/tools/smart-waf-tester", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					target_url: processedUrl,
					mode: "standard", // Could add mode options in the future
				}),
				signal, // Pass the AbortController signal
			});

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

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage =
					responseData.error || `Error: ${response.statusText}`;
				setLogs((prev) => [
					...prev,
					`[${new Date().toLocaleTimeString()}] Error: ${errorMessage}`,
				]);
				throw new Error(errorMessage);
			}

			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Test completed successfully.`,
			]);
			setResults(responseData);

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
			abortControllerRef.current = null;
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

	// Scroll console to bottom when logs update
	useEffect(() => {
		const consoleElement = document.getElementById("console-output");
		if (consoleElement) {
			consoleElement.scrollTop = consoleElement.scrollHeight;
		}
	}, [logs]);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="max-w-7xl mx-auto px-4 py-12">
			<div className="text-center mb-10">
				<div className="bg-gray-800 text-white py-12 px-6 rounded-lg shadow-lg mb-12">
					<h1 className="text-4xl font-bold mb-3">Smart WAF Tester</h1>
					<div className="flex justify-center items-center gap-2 mb-4">
						<span className="text-sm font-medium bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
							Beta
						</span>
					</div>
					<p className="text-lg max-w-3xl mx-auto">
						Test your web application firewall against common bypass techniques
						and identify potential security weaknesses
					</p>
				</div>
			</div>

			<div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12 border border-gray-100">
				<form onSubmit={handleSubmit}>
					<div className="mb-6">
						<label
							htmlFor="targetUrl"
							className="block text-steelDark font-semibold mb-2 text-gray-800"
						>
							Target Website URL
						</label>
						<input
							type="text"
							id="targetUrl"
							placeholder="https://example.com"
							value={targetUrl}
							onChange={(e) => setTargetUrl(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue focus:border-transparent transition-all duration-200 text-gray-800"
							required
							disabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 mt-2">
							Enter the full URL including http:// or https:// prefix
						</p>
					</div>

					<div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
						<label className="flex items-start cursor-pointer">
							<input
								type="checkbox"
								checked={legalConfirmation}
								onChange={(e) => setLegalConfirmation(e.target.checked)}
								className="mt-1 h-4 w-4 text-steelBlue border-gray-300 rounded focus:ring-steelBlue"
								disabled={isSubmitting}
							/>
							<span className="ml-3 text-sm text-gray-800">
								I confirm I have legal authority to test this website and take
								full responsibility for any consequences of the testing. I
								understand that unauthorized testing may violate laws and terms
								of service.
							</span>
						</label>
					</div>

					<button
						type="submit"
						disabled={isSubmitting || !targetUrl || !legalConfirmation}
						className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 bg-gray-800 hover:bg-black ${
							isSubmitting || !targetUrl || !legalConfirmation
								? "bg-gray-300 cursor-not-allowed"
								: "steel-gradient hover:saffron-gradient shadow-md hover:shadow-lg"
						}`}
					>
						{isSubmitting ? "Testing..." : "Start WAF Test"}
					</button>
				</form>

				{error && (
					<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-700">{error}</p>
					</div>
				)}
			</div>

			{/* Progress Bar and Console Output */}
			{isSubmitting && (
				<div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
					<div className="mb-4">
						<div className="flex justify-between mb-3">
							<span className="text-sm font-medium text-steelDark">
								{scanStage || "Testing..."}
							</span>
							<span className="text-sm font-medium text-steelDark">
								{progress}%
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
							<div
								className="steel-gradient h-4 rounded-full transition-all duration-300 ease-in-out"
								style={{ width: `${progress}%` }}
							></div>
						</div>
					</div>
					<div className="mt-6">
						<div className="flex justify-between items-center mb-3">
							<h3 className="text-md font-semibold text-steelDark">
								Console Output
							</h3>
							<button
								onClick={handleCancelScan}
								className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 px-3 py-1 rounded hover:bg-red-50"
								disabled={isCancelling}
							>
								{isCancelling ? "Cancelling..." : "Stop Test"}
							</button>
						</div>
						<div
							id="console-output"
							className="bg-gray-900 text-green-400 font-mono text-xs p-5 rounded-lg h-64 overflow-y-auto shadow-inner"
						>
							{logs.length > 0 ? (
								logs.map((log, index) => (
									<div key={index} className="py-1">
										{log}
									</div>
								))
							) : (
								<div>Waiting for test to start...</div>
							)}
						</div>

						{timeoutWarning && (
							<div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
								<p className="font-semibold mb-1">
									This test is taking longer than expected.
								</p>
								<p>
									Complex WAF tests can take several minutes to complete due to
									the number of bypass techniques being tested and rate
									limiting.
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Results Display */}
			{results && (
				<div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mb-12">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold text-gray-900">
							WAF Test Results for {results.target_url}
						</h2>
						<div className="text-sm text-gray-500">
							Tested on {new Date(results.scan_time).toLocaleString()}
						</div>
					</div>

					{/* Dashboard - Charts Overview */}
					<div className="mb-8 rounded-lg bg-gray-50 p-6 border border-gray-100">
						<h3 className="text-xl font-semibold text-gray-800 mb-6">
							Test Results Dashboard
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Results Distribution */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<ResultsBreakdownChart summary={results.summary} />
							</div>

							{/* Bypasses by Category */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<CategoryBypassChart summary={results.summary} />
							</div>
						</div>
					</div>

					{/* Summary Section */}
					<div
						className={`mb-6 rounded-lg ${
							expandedSections.includes("summary")
								? "bg-blue-50 border-blue-100"
								: "bg-gray-50 hover:bg-blue-50 border-gray-100 hover:border-blue-100"
						} border p-4 transition-colors cursor-pointer`}
						onClick={() => toggleSection("summary")}
					>
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-gray-800 flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 mr-2 text-blue-600"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
									<path
										fillRule="evenodd"
										d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
										clipRule="evenodd"
									/>
								</svg>
								Summary
							</h3>
							<div className="flex items-center">
								{results.summary && (
									<div className="flex items-center mr-4 space-x-2">
										<span
											className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"
											title="Successful Bypasses"
										>
											{results.summary.successful_bypasses || 0} Bypasses
										</span>
										<span
											className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700"
											title="Blocked Attempts"
										>
											{results.summary.blocked_attempts || 0} Blocked
										</span>
									</div>
								)}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className={`h-5 w-5 transition-transform transform ${
										expandedSections.includes("summary") ? "rotate-180" : ""
									}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>

						{expandedSections.includes("summary") && (
							<div className="mt-4">
								{/* Summary stats */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
									<div className="bg-white p-4 rounded-lg border border-gray-100">
										<div className="text-sm text-gray-600">Total Tests</div>
										<div className="text-2xl font-bold">
											{results.summary.total_tests}
										</div>
									</div>
									<div className="bg-red-50 p-4 rounded-lg border border-red-100">
										<div className="text-sm text-red-600">
											Successful Bypasses
										</div>
										<div className="text-2xl font-bold text-red-600">
											{results.summary.successful_bypasses}
										</div>
									</div>
									<div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
										<div className="text-sm text-emerald-600">
											Blocked Attempts
										</div>
										<div className="text-2xl font-bold text-emerald-600">
											{results.summary.blocked_attempts}
										</div>
									</div>
									<div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
										<div className="text-sm text-amber-600">Failed Tests</div>
										<div className="text-2xl font-bold text-amber-600">
											{results.summary.failed_tests}
										</div>
									</div>
								</div>

								{/* Security assessment */}
								<div className="mb-4 bg-white p-4 rounded-lg border border-gray-100">
									<h4 className="font-medium mb-2 text-gray-800">
										Security Assessment
									</h4>
									<p className="text-gray-700 whitespace-pre-line">
										{results.summary.successful_bypasses === 0
											? "Your WAF appears to be effective against all tested bypass techniques. Continue monitoring for new attack vectors as attackers constantly develop new evasion methods."
											: results.summary.successful_bypasses <= 1
											? "Your WAF is mostly effective but has a vulnerability that could be exploited. Review the specific bypass technique that succeeded and adjust your WAF rules accordingly."
											: results.summary.successful_bypasses <= 3
											? "Your WAF has several vulnerabilities that should be addressed. The bypass techniques that succeeded represent security gaps that attackers could potentially exploit."
											: "Your WAF has significant vulnerabilities. Multiple bypass techniques were successful, suggesting that your current WAF configuration may not provide adequate protection against common attacks."}
									</p>
								</div>

								{/* Recommendations */}
								<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
									<h4 className="font-medium mb-2 text-blue-800">
										Recommendations
									</h4>
									<ul className="list-disc list-inside text-blue-700 space-y-2">
										{results.summary.successful_bypasses > 0 && (
											<li>
												Review and update your WAF rules to address the
												successful bypass techniques
											</li>
										)}
										<li>
											Implement defense in depth - don't rely solely on your WAF
											for application security
										</li>
										<li>
											Regularly test your WAF against new bypass techniques
										</li>
										<li>
											Consider using a commercial WAF solution with regularly
											updated rule sets
										</li>
										<li>
											Combine WAF protection with secure coding practices and
											regular security testing
										</li>
									</ul>
								</div>
							</div>
						)}
					</div>

					{/* Test Details Section */}
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<div className="steel-gradient text-white p-5">
							<h3 className="text-xl font-bold">Detailed Test Results</h3>
						</div>
						<div className="p-6">
							{results.results.map((result, index) => (
								<div
									key={index}
									className={`mb-4 p-4 rounded-lg border ${
										result.status === "Success"
											? "bg-red-50 border-red-200"
											: result.status === "Blocked"
											? "bg-emerald-50 border-emerald-200"
											: "bg-amber-50 border-amber-200"
									}`}
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
										<div className="flex items-center">
											<span
												className={`inline-block w-3 h-3 rounded-full mr-2 ${
													result.status === "Success"
														? "bg-red-500"
														: result.status === "Blocked"
														? "bg-emerald-500"
														: "bg-amber-500"
												}`}
											></span>
											<h4 className="font-bold text-gray-900">
												{result.technique}
											</h4>
										</div>
										<div className="mt-2 md:mt-0 flex items-center">
											<span className="text-xs mr-2 text-gray-500">
												{result.category}
											</span>
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													result.status === "Success"
														? "bg-red-100 text-red-800"
														: result.status === "Blocked"
														? "bg-emerald-100 text-emerald-800"
														: "bg-amber-100 text-amber-800"
												}`}
											>
												{result.status}
											</span>
										</div>
									</div>
									<p className="text-gray-700 mb-2">{result.description}</p>
									<div className="bg-white bg-opacity-60 p-3 rounded border text-sm">
										<details>
											<summary className="font-medium cursor-pointer">
												Technical Details
											</summary>
											<div className="mt-2 pl-4 border-l-2 border-gray-200 text-gray-600">
												{result.details}
											</div>
										</details>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="max-w-3xl mx-auto mt-16 mb-12">
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="bg-gray-800 text-white p-6">
						<h2 className="text-2xl font-bold">About Smart WAF Tester</h2>
					</div>
					<div className="p-8">
						<p className="mb-6 text-gray-700 leading-relaxed">
							Smart WAF Tester is a specialized tool designed to evaluate the
							effectiveness of your Web Application Firewall (WAF) against
							common bypass techniques, including:
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<ul className="space-y-3">
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											SQL Injection bypasses
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Cross-Site Scripting (XSS) evasions
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											HTTP Header manipulation
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Path traversal techniques
										</span>
									</li>
								</ul>
							</div>
							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<ul className="space-y-3">
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Command injection evasions
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Protocol-level bypasses
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Advanced encoding techniques
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Character set manipulations
										</span>
									</li>
								</ul>
							</div>
						</div>
						<div className="mb-8">
							<p className="text-gray-700 leading-relaxed">
								The tester identifies vulnerabilities in your WAF configuration
								by attempting various bypass techniques and reporting which ones
								succeeded or were blocked.
							</p>
						</div>
						<div className="saffron-gradient text-white p-6 rounded-lg shadow-md">
							<p className="font-semibold mb-3">⚠️ Legal Disclaimer:</p>
							<p className="text-sm leading-relaxed">
								This tool is intended for security testing purposes only. Only
								test websites you own or have explicit permission to test.
								Unauthorized security testing may violate computer fraud and
								abuse laws, terms of service agreements, and other regulations.
								Always use this tool responsibly and ethically.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
