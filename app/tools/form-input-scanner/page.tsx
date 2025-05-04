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
	RadialLinearScale,
	PointElement,
	LineElement,
} from "chart.js";
import { Doughnut, Bar, Radar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	RadialLinearScale,
	PointElement,
	LineElement
);

// Define types for the scan results
interface Vulnerability {
	id: string;
	name: string;
	description: string;
	risk_level: "High" | "Medium" | "Low";
	field_name: string;
	field_type: string;
	payload_used: string;
	details: string;
	remediation: string;
	category: string;
}

interface Form {
	id: string;
	name: string;
	action: string;
	method: string;
	fields: {
		name: string;
		type: string;
		validation: string[];
	}[];
	vulnerabilities: Vulnerability[];
}

interface ScanResults {
	target_url: string;
	scan_time: string;
	scan_mode: "lightweight" | "heavy";
	forms_found: Form[];
	summary: {
		total_forms: number;
		total_fields: number;
		total_vulnerabilities: number;
		high_risks: number;
		medium_risks: number;
		low_risks: number;
		vulnerability_by_category?: Record<string, number>;
		categories?: string[];
		ai_summary?: string;
	};
}

// Chart components for visualizing the results
const VulnerabilityBreakdownChart = ({ summary }: { summary: any }) => {
	if (!summary) return null;

	const data = {
		labels: ["High Risk", "Medium Risk", "Low Risk"],
		datasets: [
			{
				label: "Vulnerabilities by Risk Level",
				data: [
					summary.high_risks || 0,
					summary.medium_risks || 0,
					summary.low_risks || 0,
				],
				backgroundColor: [
					"rgba(220, 38, 38, 0.7)", // red-600 with opacity
					"rgba(245, 158, 11, 0.7)", // amber-500 with opacity
					"rgba(16, 185, 129, 0.7)", // emerald-500 with opacity
				],
				borderColor: [
					"rgb(220, 38, 38)",
					"rgb(245, 158, 11)",
					"rgb(16, 185, 129)",
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
				text: "Vulnerabilities by Risk Level",
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

const VulnerabilityByCategoryChart = ({ summary }: { summary: any }) => {
	if (!summary || !summary.categories || !summary.vulnerability_by_category)
		return null;

	const data = {
		labels: summary.categories,
		datasets: [
			{
				label: "Vulnerabilities by Category",
				data: summary.categories.map(
					(cat: string) => summary.vulnerability_by_category[cat] || 0
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
				text: "Vulnerabilities by Category",
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

const VulnerabilityRadarChart = ({
	results,
}: {
	results: ScanResults | null;
}) => {
	if (!results || !results.summary) return null;

	// Define categories for the radar chart
	const categories = [
		"XSS Protection",
		"SQL Injection Defense",
		"CSRF Protection",
		"Input Validation",
		"Client-Side Security",
		"Command Injection Defense",
	];

	// Calculate scores for each category based on vulnerabilities found
	// Higher score = better protection (fewer vulnerabilities)
	const calculateScores = () => {
		const scores = [100, 100, 100, 100, 100, 100]; // Start with perfect scores

		// Reduce scores based on vulnerabilities found
		results.forms_found.forEach((form) => {
			form.vulnerabilities.forEach((vuln) => {
				const category = vuln.category;
				const reduction =
					vuln.risk_level === "High"
						? 30
						: vuln.risk_level === "Medium"
						? 15
						: 5;

				switch (category) {
					case "XSS":
						scores[0] = Math.max(0, scores[0] - reduction);
						break;
					case "SQL Injection":
						scores[1] = Math.max(0, scores[1] - reduction);
						break;
					case "CSRF":
						scores[2] = Math.max(0, scores[2] - reduction);
						break;
					case "Input Validation":
						scores[3] = Math.max(0, scores[3] - reduction);
						break;
					case "Client-Side Security":
						scores[4] = Math.max(0, scores[4] - reduction);
						break;
					case "Command Injection":
						scores[5] = Math.max(0, scores[5] - reduction);
						break;
				}
			});
		});

		return scores;
	};

	const data = {
		labels: categories,
		datasets: [
			{
				label: "Security Score",
				data: calculateScores(),
				backgroundColor: "rgba(37, 99, 235, 0.2)", // blue-600
				borderColor: "rgba(37, 99, 235, 1)",
				borderWidth: 2,
				pointBackgroundColor: "rgba(37, 99, 235, 1)",
				pointBorderColor: "#fff",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "rgba(37, 99, 235, 1)",
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			r: {
				angleLines: {
					display: true,
				},
				suggestedMin: 0,
				suggestedMax: 100,
			},
		},
		plugins: {
			title: {
				display: true,
				text: "Form Security Analysis",
				color: "#1e3a8a", // blue-900
				font: {
					size: 16,
				},
			},
		},
	};

	return (
		<div className="h-80">
			<Radar data={data} options={options} />
		</div>
	);
};

export default function FormInputScannerPage() {
	const [targetUrl, setTargetUrl] = useState("");
	const [scanMode, setScanMode] = useState<"lightweight" | "heavy">(
		"lightweight"
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [results, setResults] = useState<ScanResults | null>(null);
	const [expandedSections, setExpandedSections] = useState<string[]>([]);
	const [expandedForms, setExpandedForms] = useState<string[]>([]);
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
				"You must confirm that you have legal authority to scan this website."
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
		setScanStage("Initializing scan...");
		setIsCancelling(false);
		setTimeoutWarning(false);
		setExpandedSections([]);
		setExpandedForms([]);

		// Create a new AbortController for this request
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;

		// Setup for simulating progress updates and log messages
		let progressInterval: NodeJS.Timeout;
		let currentProgress = 0;
		const lightweightScanStages = [
			"Setting up crawler...",
			"Identifying forms on target page...",
			"Analyzing form fields...",
			"Testing client-side validation...",
			"Preparing safe payload injections...",
			"Running heuristic analysis...",
			"Generating AI-powered explanations...",
			"Compiling results...",
		];

		const heavyScanStages = [
			"Setting up advanced crawler...",
			"Identifying forms across website...",
			"Analyzing form fields and validation...",
			"Preparing adaptive payloads...",
			"Testing client-side validation...",
			"Setting up headless browser for DOM testing...",
			"Performing XSS payload injection...",
			"Testing SQL injection vectors...",
			"Attempting CSRF bypass methods...",
			"Testing for command injection vulnerabilities...",
			"Running advanced heuristic analysis...",
			"Generating AI-powered risk assessment...",
			"Compiling comprehensive results...",
		];

		const scanStages =
			scanMode === "lightweight" ? lightweightScanStages : heavyScanStages;

		// Set a timeout to show warning for long-running scans
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setTimeoutWarning(true);
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] The scan is taking longer than expected. Please be patient or consider cancelling.`,
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
			// Log the start of the scan
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Starting ${scanMode} form scan for ${processedUrl}...`,
			]);

			// Make API call to the backend
			const response = await fetch("/api/tools/form-input-scanner", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					target_url: processedUrl,
					mode: scanMode,
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
					`[${new Date().toLocaleTimeString()}] Scan cancelled by user.`,
				]);
				setIsSubmitting(false);
				setProgress(0);
				setScanStage("");
				return;
			}

			setProgress(100);
			setScanStage("Scan completed");

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
				`[${new Date().toLocaleTimeString()}] Scan completed successfully.`,
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
					`[${new Date().toLocaleTimeString()}] Scan cancelled by user.`,
				]);
			} else {
				setProgress(0);
				setScanStage("");

				// Create a more detailed error message
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to scan forms. Please try again later.";
				setError(`Error during scan: ${errorMessage}`);

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
				`[${new Date().toLocaleTimeString()}] Cancelling scan...`,
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

	const toggleForm = (formId: string) => {
		setExpandedForms((prev) =>
			prev.includes(formId)
				? prev.filter((id) => id !== formId)
				: [...prev, formId]
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
					<h1 className="text-4xl font-bold mb-3">
						Form Input Vulnerability Scanner
					</h1>
					<div className="flex justify-center items-center gap-2 mb-4">
						<span className="text-sm font-medium bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
							Beta
						</span>
					</div>
					<p className="text-lg max-w-3xl mx-auto">
						Automatically detect vulnerabilities in web forms such as XSS, SQL
						Injection, and Command Injection with AI-enhanced risk assessment
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
							placeholder="https://example.com/contact"
							value={targetUrl}
							onChange={(e) => setTargetUrl(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue focus:border-transparent transition-all duration-200 text-gray-800"
							required
							disabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 mt-2">
							Enter the full URL to the page containing the form(s) to scan
						</p>
					</div>

					<div className="mb-6">
						<label className="block text-steelDark font-semibold mb-3 text-gray-800">
							Scan Mode
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-steelBlue hover:shadow-sm">
								<input
									type="radio"
									value="lightweight"
									checked={scanMode === "lightweight"}
									onChange={() => setScanMode("lightweight")}
									className="h-4 w-4 text-steelBlue border-gray-300 focus:ring-steelBlue"
									disabled={isSubmitting}
								/>
								<div className="ml-3">
									<span className="block font-medium text-gray-800">
										Lightweight Assessment
									</span>
									<span className="text-sm text-gray-500">
										Non-destructive, safe scanning
									</span>
								</div>
							</label>
							<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-steelBlue hover:shadow-sm">
								<input
									type="radio"
									value="heavy"
									checked={scanMode === "heavy"}
									onChange={() => setScanMode("heavy")}
									className="h-4 w-4 text-steelBlue border-gray-300 focus:ring-steelBlue"
									disabled={isSubmitting}
								/>
								<div className="ml-3">
									<span className="block font-medium text-gray-800">
										Heavy Assessment
									</span>
									<span className="text-sm text-gray-500">
										Deep scanning with adaptive payloads
									</span>
								</div>
							</label>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							{scanMode === "lightweight"
								? "Lightweight mode is safe and non-destructive, but less thorough"
								: "Heavy mode performs deeper analysis but may submit test data to forms"}
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
								I confirm that I have legal authority to scan this website and
								take full responsibility for any consequences of the testing. I
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
						{isSubmitting ? "Scanning..." : "Start Form Scan"}
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
								{scanStage || "Scanning..."}
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
								{isCancelling ? "Cancelling..." : "Stop Scan"}
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
								<div>Waiting for scan to start...</div>
							)}
						</div>

						{timeoutWarning && (
							<div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
								<p className="font-semibold mb-1">
									This scan is taking longer than expected.
								</p>
								<p>
									Complex form analysis can take several minutes to complete,
									especially in heavy assessment mode with many forms to
									analyze.
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
							Form Scan Results for {results.target_url}
						</h2>
						<div className="text-sm text-gray-500">
							Scanned on {new Date(results.scan_time).toLocaleString()}
						</div>
					</div>

					{/* Dashboard - Charts Overview */}
					<div className="mb-8 rounded-lg bg-gray-50 p-6 border border-gray-100">
						<h3 className="text-xl font-semibold text-gray-800 mb-6">
							Security Dashboard
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Vulnerability Breakdown */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<VulnerabilityBreakdownChart summary={results.summary} />
							</div>

							{/* Vulnerability By Category */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<VulnerabilityByCategoryChart summary={results.summary} />
							</div>

							{/* Security Profile Radar */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 md:col-span-2 lg:col-span-1">
								<VulnerabilityRadarChart results={results} />
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
											title="High Risk Findings"
										>
											{results.summary.high_risks || 0} High
										</span>
										<span
											className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
											title="Medium Risk Findings"
										>
											{results.summary.medium_risks || 0} Medium
										</span>
										<span
											className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700"
											title="Low Risk Findings"
										>
											{results.summary.low_risks || 0} Low
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
								<div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="bg-white p-4 rounded-lg border border-gray-100">
										<div className="text-sm text-gray-600">Forms Found</div>
										<div className="text-2xl font-bold">
											{results.summary.total_forms}
										</div>
									</div>
									<div className="bg-white p-4 rounded-lg border border-gray-100">
										<div className="text-sm text-gray-600">Fields Analyzed</div>
										<div className="text-2xl font-bold">
											{results.summary.total_fields}
										</div>
									</div>
									<div className="bg-white p-4 rounded-lg border border-gray-100">
										<div className="text-sm text-gray-600">
											Total Vulnerabilities
										</div>
										<div className="text-2xl font-bold">
											{results.summary.total_vulnerabilities}
										</div>
									</div>
								</div>

								{/* AI Summary */}
								{results.summary.ai_summary && (
									<div className="mb-4 bg-white p-4 rounded-lg border border-gray-100">
										<h4 className="font-medium mb-2 text-gray-800 flex items-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 mr-2 text-blue-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
											AI-Enhanced Analysis
										</h4>
										<p className="text-gray-700 whitespace-pre-line">
											{results.summary.ai_summary}
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Forms List */}
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<div className="steel-gradient text-white p-5">
							<h3 className="text-xl font-bold">
								Discovered Forms ({results.forms_found.length})
							</h3>
						</div>
						<div className="p-8 space-y-6">
							{results.forms_found.length > 0 ? (
								results.forms_found.map((form) => (
									<div
										key={form.id}
										className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
									>
										<button
											onClick={() => toggleForm(form.id)}
											className="w-full flex justify-between items-center p-5 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800"
										>
											<div className="flex items-center">
												<span className="mr-3 bg-gray-200 px-3 py-1 rounded-lg text-xs">
													{form.method.toUpperCase()}
												</span>
												<span className="mr-2">
													{form.name || "Unnamed Form"}
												</span>
												{form.vulnerabilities.length > 0 && (
													<span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
														{form.vulnerabilities.length}{" "}
														{form.vulnerabilities.length === 1
															? "issue"
															: "issues"}
													</span>
												)}
											</div>
											<span className="text-lg text-steelBlue flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
												{expandedForms.includes(form.id) ? "−" : "+"}
											</span>
										</button>

										{expandedForms.includes(form.id) && (
											<div className="p-5 text-sm bg-white border-t border-gray-100">
												<div className="mb-4">
													<h4 className="font-semibold mb-2">Form Details</h4>
													<table className="w-full text-sm">
														<tbody>
															<tr className="border-b border-gray-100">
																<td className="py-2 font-medium text-gray-600">
																	Name:
																</td>
																<td className="py-2 pl-4">
																	{form.name || "Unnamed Form"}
																</td>
															</tr>
															<tr className="border-b border-gray-100">
																<td className="py-2 font-medium text-gray-600">
																	Action:
																</td>
																<td className="py-2 pl-4 overflow-x-auto">
																	<code className="bg-gray-100 px-2 py-1 rounded text-xs">
																		{form.action || "Current URL"}
																	</code>
																</td>
															</tr>
															<tr>
																<td className="py-2 font-medium text-gray-600">
																	Method:
																</td>
																<td className="py-2 pl-4">
																	<span className="bg-gray-200 px-2 py-1 rounded text-xs">
																		{form.method.toUpperCase()}
																	</span>
																</td>
															</tr>
														</tbody>
													</table>
												</div>

												{/* Form Fields */}
												<div className="mb-4">
													<h4 className="font-semibold mb-2">
														Form Fields ({form.fields.length})
													</h4>
													<div className="bg-gray-50 p-3 rounded border border-gray-100 overflow-x-auto">
														<table className="w-full text-xs">
															<thead>
																<tr className="bg-gray-100">
																	<th className="py-2 px-3 text-left">
																		Field Name
																	</th>
																	<th className="py-2 px-3 text-left">Type</th>
																	<th className="py-2 px-3 text-left">
																		Validation
																	</th>
																</tr>
															</thead>
															<tbody>
																{form.fields.map((field, i) => (
																	<tr
																		key={i}
																		className="border-b border-gray-100"
																	>
																		<td className="py-2 px-3">{field.name}</td>
																		<td className="py-2 px-3">{field.type}</td>
																		<td className="py-2 px-3">
																			{field.validation.length > 0 ? (
																				<div className="flex flex-wrap gap-1">
																					{field.validation.map((val, j) => (
																						<span
																							key={j}
																							className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
																						>
																							{val}
																						</span>
																					))}
																				</div>
																			) : (
																				<span className="text-gray-400">
																					None
																				</span>
																			)}
																		</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>

												{/* Vulnerabilities */}
												{form.vulnerabilities.length > 0 ? (
													<div>
														<h4 className="font-semibold mb-2">
															Detected Vulnerabilities
														</h4>
														<div className="space-y-4">
															{form.vulnerabilities.map((vuln) => (
																<div
																	key={vuln.id}
																	className={`p-4 rounded-lg ${
																		vuln.risk_level === "High"
																			? "bg-red-50 border border-red-100"
																			: vuln.risk_level === "Medium"
																			? "bg-amber-50 border border-amber-100"
																			: "bg-emerald-50 border border-emerald-100"
																	}`}
																>
																	<div className="flex flex-col md:flex-row md:justify-between mb-2">
																		<h5 className="font-semibold flex items-center">
																			<span
																				className={`inline-block w-3 h-3 rounded-full mr-2 ${
																					vuln.risk_level === "High"
																						? "bg-red-500"
																						: vuln.risk_level === "Medium"
																						? "bg-amber-500"
																						: "bg-emerald-500"
																				}`}
																			></span>
																			{vuln.name}
																		</h5>
																		<div className="mt-1 md:mt-0 flex items-center">
																			<span
																				className={`px-2 py-1 text-xs font-medium rounded ${
																					vuln.risk_level === "High"
																						? "bg-red-100 text-red-800"
																						: vuln.risk_level === "Medium"
																						? "bg-amber-100 text-amber-800"
																						: "bg-emerald-100 text-emerald-800"
																				}`}
																			>
																				{vuln.risk_level} Risk
																			</span>
																		</div>
																	</div>
																	<p className="text-gray-700 mb-2">
																		{vuln.description}
																	</p>

																	<div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
																		<div className="bg-white bg-opacity-60 p-3 rounded border border-gray-200">
																			<span className="block text-xs font-semibold mb-1 text-gray-600">
																				Affected Field
																			</span>
																			<div className="flex items-center">
																				<span className="bg-gray-100 px-2 py-1 rounded mr-2">
																					{vuln.field_type}
																				</span>
																				<code className="text-blue-700">
																					{vuln.field_name}
																				</code>
																			</div>
																		</div>

																		<div className="bg-white bg-opacity-60 p-3 rounded border border-gray-200">
																			<span className="block text-xs font-semibold mb-1 text-gray-600">
																				Test Payload
																			</span>
																			<code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto">
																				{vuln.payload_used}
																			</code>
																		</div>
																	</div>

																	<details className="mt-3">
																		<summary className="cursor-pointer text-blue-600 text-sm font-medium">
																			Technical Details
																		</summary>
																		<div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
																			<p className="text-sm text-gray-700">
																				{vuln.details}
																			</p>
																		</div>
																	</details>

																	<div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
																		<span className="block text-xs font-semibold mb-1 text-blue-700">
																			Remediation
																		</span>
																		<p className="text-sm text-blue-800">
																			{vuln.remediation}
																		</p>
																	</div>
																</div>
															))}
														</div>
													</div>
												) : (
													<div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
														<div className="flex items-center">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-5 w-5 mr-2"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
															No vulnerabilities detected in this form.
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								))
							) : (
								<div className="p-4 text-center bg-gray-50 rounded-lg">
									<p className="text-gray-500">
										No forms were discovered on the target URL.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<div className="max-w-3xl mx-auto mt-16 mb-12">
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="bg-gray-800 text-white p-6">
						<h2 className="text-2xl font-bold">
							About Form Input Vulnerability Scanner
						</h2>
					</div>
					<div className="p-8">
						<p className="mb-6 text-gray-700 leading-relaxed">
							The Form Input Vulnerability Scanner is a powerful tool designed
							to identify security vulnerabilities in web forms. It offers two
							scan modes:
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
									<span className="mr-2 bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm">
										🌱
									</span>
									Lightweight Assessment
								</h3>
								<ul className="space-y-3">
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Form Crawler</strong> - Scans and lists all input
											forms on a page
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Smart Payload Injection</strong> - Uses
											non-destructive payloads
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Client-side Validation Testing</strong> - Detects
											bypassable JavaScript validation
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Basic Heuristics</strong> - Shows indicators like
											reflected input
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>AI Explanations</strong> - Explains why issues are
											risky
										</span>
									</li>
								</ul>
							</div>

							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
									<span className="mr-2 bg-red-100 text-red-800 rounded-full h-6 w-6 flex items-center justify-center text-sm">
										🔥
									</span>
									Heavy Assessment
								</h3>
								<ul className="space-y-3">
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Form Auto-Submission</strong> - Actively submits
											forms with test payloads
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Adaptive Payload Mutation</strong> - Evolves
											inputs based on server response
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>DOM & JS Analysis</strong> - Tests DOM XSS using
											headless browser
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Authenticated Testing</strong> - Tests forms
											behind login pages
										</span>
									</li>
									<li className="flex items-start">
										<span className="mr-2 text-steelBlue mt-1">✓</span>
										<span className="text-gray-800">
											<strong>Detailed AI Risk Report</strong> - Provides OWASP
											mapping and remediation strategies
										</span>
									</li>
								</ul>
							</div>
						</div>

						<div className="mb-8">
							<p className="text-gray-700 leading-relaxed">
								The scanner identifies vulnerabilities in form inputs including
								XSS (Cross-Site Scripting), SQL Injection, CSRF (Cross-Site
								Request Forgery), and Command Injection vulnerabilities. Each
								finding is analyzed by AI to provide context, risk assessment,
								and remediation strategies.
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
