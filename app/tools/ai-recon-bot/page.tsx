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
interface Finding {
	name: string;
	description: string;
	risk_level: "High" | "Medium" | "Low";
	details: Record<string, any>;
}

interface ScanResults {
	domain: string;
	scan_time: string;
	findings: Finding[];
	whois?: Record<string, any>;
	dns?: Record<string, any>;
	ssl?: Record<string, any>;
	http_headers?: Record<string, any>;
	open_ports?: Record<string, any>;
	cdn_waf?: Record<string, any>;
	ip_geolocation?: Record<string, any>;
	subdomains?: Record<string, any>;
	robots_sitemap?: Record<string, any>;
	directory_fingerprint?: any[];
	rate_limit?: any[];
	github_metadata?: Record<string, any>;
	summary?: {
		high_risks: number;
		medium_risks: number;
		low_risks: number;
		total_findings: number;
		text?: string;
		findings?: Finding[];
	};
}

// Chart components for visualizing the results
const RiskSummaryChart = ({ summary }: { summary: any }) => {
	if (!summary) return null;

	const data = {
		labels: ["High Risk", "Medium Risk", "Low Risk"],
		datasets: [
			{
				label: "Risk Findings",
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
				text: "Risk Distribution",
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

const SecurityScoreChart = ({ summary }: { summary: any }) => {
	if (!summary) return null;

	// Calculate a security score based on the findings
	// Lower score = more issues found = less secure
	const highImpact = (summary.high_risks || 0) * 10;
	const mediumImpact = (summary.medium_risks || 0) * 5;
	const lowImpact = (summary.low_risks || 0) * 2;

	const totalImpact = highImpact + mediumImpact + lowImpact;
	// Score from 0-100, where 100 is perfect (no issues)
	// Base score is 100, subtract impact
	let securityScore = Math.max(0, 100 - totalImpact);

	// Determine color based on score
	let color;
	if (securityScore >= 80) {
		color = "rgba(16, 185, 129, 0.7)"; // emerald-500
	} else if (securityScore >= 60) {
		color = "rgba(245, 158, 11, 0.7)"; // amber-500
	} else {
		color = "rgba(220, 38, 38, 0.7)"; // red-600
	}

	const data = {
		labels: ["Security Score"],
		datasets: [
			{
				label: "Score",
				data: [securityScore],
				backgroundColor: [color],
				borderColor: [color.replace("0.7", "1")],
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
				text: "Security Score",
				color: "#1e3a8a", // blue-900
				font: {
					size: 16,
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				max: 100,
				ticks: {
					callback: function (value: any) {
						return value + "%";
					},
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

const SecurityProfileChart = ({ results }: { results: ScanResults | null }) => {
	if (!results) return null;

	// Define categories to evaluate
	const categories = [
		"Domain Security",
		"SSL Security",
		"HTTP Headers",
		"Infrastructure",
		"WAF Protection",
		"Exposure Control",
	];

	// Calculate scores for each category based on results
	// This is a simplified scoring mechanism - you would want to make this more detailed
	const calculateDomainScore = () => {
		let score = 100;
		// Reduce score for each subdomain (indicates larger attack surface)
		const subdomains = results.subdomains?.subdomains || [];
		if (Array.isArray(subdomains)) {
			score -= Math.min(50, subdomains.length * 5);
		}
		// Check WHOIS privacy
		const whois = results.whois || {};
		if (whois.privacy === false) score -= 10;
		return Math.max(0, score);
	};

	const calculateSSLScore = () => {
		let score = 100;
		const ssl = results.ssl || {};
		// Check for various SSL issues
		if (ssl.expiry_days && ssl.expiry_days < 30) score -= 30;
		if (ssl.expired) score -= 100;
		if (ssl.self_signed) score -= 50;
		return Math.max(0, score);
	};

	const calculateHeadersScore = () => {
		let score = 100;
		const headers = results.http_headers || {};
		// Common security headers
		const securityHeaders = [
			"Strict-Transport-Security",
			"Content-Security-Policy",
			"X-Content-Type-Options",
			"X-Frame-Options",
			"X-XSS-Protection",
		];
		// Reduce score for each missing security header
		for (const header of securityHeaders) {
			if (!headers[header]) score -= 15;
		}
		return Math.max(0, score);
	};

	const calculateInfrastructureScore = () => {
		let score = 100;
		// Check for open ports
		const ports = results.open_ports?.open_ports || [];
		if (Array.isArray(ports)) {
			score -= Math.min(50, ports.length * 5);
		}
		return Math.max(0, score);
	};

	const calculateWAFScore = () => {
		let score = 100;
		const waf = results.cdn_waf || {};
		if (!waf.waf_detected) score -= 40;
		if (!waf.cdn_detected) score -= 20;
		return Math.max(0, score);
	};

	const calculateExposureScore = () => {
		let score = 100;
		// Check directory fingerprinting
		const directories = results.directory_fingerprint || [];
		if (Array.isArray(directories)) {
			// Count high-risk directories
			const highRiskCount = directories.filter((d) => d.risk === "High").length;
			score -= highRiskCount * 20;
		}

		// Check GitHub exposure
		const github = results.github_metadata || {};
		if (github.detected) score -= 10;

		return Math.max(0, score);
	};

	const scores = [
		calculateDomainScore() / 100,
		calculateSSLScore() / 100,
		calculateHeadersScore() / 100,
		calculateInfrastructureScore() / 100,
		calculateWAFScore() / 100,
		calculateExposureScore() / 100,
	];

	const data = {
		labels: categories,
		datasets: [
			{
				label: "Security Profile",
				data: scores.map((s) => s * 100),
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
				text: "Security Profile Analysis",
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

export default function AIReconBotPage() {
	const [domain, setDomain] = useState("");
	const [scanMode, setScanMode] = useState<"light" | "full">("light");
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
				"You must confirm that you have legal authority to scan this domain."
			);
			return;
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

		// Create a new AbortController for this request
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;

		// Setup for simulating progress updates and log messages
		let progressInterval: NodeJS.Timeout;
		let currentProgress = 0;
		const scanStages = [
			"Collecting WHOIS data...",
			"Examining DNS records...",
			"Verifying SSL certificate...",
			"Checking HTTP headers...",
			"Scanning for open ports...",
			"Enumerating subdomains...",
			"Assessing rate limiting...",
			"Checking directory exposure...",
			"Analyzing GitHub metadata...",
			"Compiling results...",
		];

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
					Math.floor(currentProgress / 10),
					scanStages.length - 1
				);
				setScanStage(scanStages[stageIndex]);

				// Add log messages at certain progress points
				if (
					currentProgress % 10 === 0 ||
					stageIndex !== Math.floor((currentProgress - 1) / 10)
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
			// Make API call to the backend
			setLogs((prev) => [
				...prev,
				`[${new Date().toLocaleTimeString()}] Sending scan request for ${domain} (${scanMode} mode)...`,
			]);

			const response = await fetch("/api/tools/ai-recon-bot", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					domain,
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
				if (responseData.traceback) {
					setLogs((prev) => [
						...prev,
						`[${new Date().toLocaleTimeString()}] Traceback: ${responseData.traceback
							.split("\n")
							.join(" | ")}`,
					]);
				}
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
						: "Failed to scan domain. Please try again later.";
				setError(`Error during scan: ${errorMessage}`);

				// Log the error details
				if (err instanceof Error) {
					console.error("Scan error:", err);
					setLogs((prev) => [
						...prev,
						`[${new Date().toLocaleTimeString()}] Error: ${errorMessage}`,
					]);
				} else {
					setLogs((prev) => [
						...prev,
						`[${new Date().toLocaleTimeString()}] Error: Failed to scan domain. Unknown error occurred.`,
					]);
				}
			}
		} finally {
			setIsSubmitting(false);
			abortControllerRef.current = null;
		}
	};

	const handleCancelScan = () => {
		setIsCancelling(true);
		setLogs((prev) => [
			...prev,
			`[${new Date().toLocaleTimeString()}] Cancelling scan...`,
		]);

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	};

	const toggleSection = (section: string) => {
		if (expandedSections.includes(section)) {
			setExpandedSections(expandedSections.filter((s) => s !== section));
		} else {
			setExpandedSections([...expandedSections, section]);
		}
	};

	const renderObjectData = (data: Record<string, any>) => {
		// Handle error messages
		if (data.error) {
			return (
				<div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
					<div className="flex items-center mb-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="font-medium">Error</span>
					</div>
					<p className="break-words">{data.error}</p>
				</div>
			);
		}

		// Display "No data available" for empty objects
		if (Object.keys(data).length === 0) {
			return (
				<div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 text-center">
					<p>No data available</p>
				</div>
			);
		}

		return (
			<div className="space-y-3">
				{Object.entries(data).map(([key, value], index) => (
					<div
						key={key}
						className={`${index !== 0 ? "pt-3 border-t border-gray-100" : ""}`}
					>
						<div className="font-medium text-steelBlue mb-1 break-words">
							{key}:
						</div>
						{typeof value === "object" && value !== null ? (
							<div className="pl-4 ml-2 border-l-2 border-gray-200">
								{renderObjectData(value as Record<string, any>)}
							</div>
						) : (
							<div className="pl-4 ml-2 text-gray-700 break-words overflow-x-auto">
								{String(value)}
							</div>
						)}
					</div>
				))}
			</div>
		);
	};

	const renderArrayData = (data: any[]) => {
		// Handle empty arrays
		if (data.length === 0) {
			return (
				<div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 text-center">
					<p>No data available</p>
				</div>
			);
		}

		// Handle arrays with error objects
		if (data.length === 1 && typeof data[0] === "object" && data[0].error) {
			return renderObjectData(data[0]);
		}

		return (
			<div className="space-y-2">
				{data.map((item, index) => (
					<div key={index} className="flex items-start mb-2">
						<div className="mr-2 mt-1 text-steelBlue flex-shrink-0">•</div>
						<div className="flex-1 break-words overflow-x-auto">
							{typeof item === "object" && item !== null ? (
								renderObjectData(item)
							) : (
								<span className="text-gray-700 break-words">
									{String(item)}
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderSectionContent = (section: string, data: any) => {
		if (!data)
			return (
				<div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 text-center">
					<p>No data available</p>
				</div>
			);

		if (data.error) {
			return (
				<div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
					<div className="flex items-center mb-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="font-medium">Error</span>
					</div>
					<p className="break-words">{data.error}</p>
				</div>
			);
		}

		if (Array.isArray(data)) {
			return renderArrayData(data);
		}

		if (typeof data === "object") {
			return renderObjectData(data);
		}

		return (
			<p className="text-gray-700 break-words overflow-x-auto">
				{String(data)}
			</p>
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
					<h1 className="text-4xl font-bold mb-3">AI Recon Bot</h1>
					<div className="flex justify-center items-center gap-2 mb-4">
						<span className="text-sm font-medium bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
							Beta
						</span>
					</div>
					<p className="text-lg max-w-3xl mx-auto">
						Scan any domain for surface-level security risks with automated risk
						tagging
					</p>
				</div>
			</div>

			<div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12 border border-gray-100">
				<form onSubmit={handleSubmit}>
					<div className="mb-6">
						<label
							htmlFor="domain"
							className="block text-steelDark font-semibold mb-2 text-gray-800"
						>
							Domain to Scan
						</label>
						<input
							type="text"
							id="domain"
							placeholder="example.com"
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steelBlue focus:border-transparent transition-all duration-200 text-gray-800"
							required
							disabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 mt-2">
							Enter a domain name without http:// or https:// prefix
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
									value="light"
									checked={scanMode === "light"}
									onChange={() => setScanMode("light")}
									className="h-4 w-4 text-steelBlue border-gray-300 focus:ring-steelBlue"
									disabled={isSubmitting}
								/>
								<div className="ml-3">
									<span className="block font-medium text-gray-800">
										Light Scan
									</span>
									<span className="text-sm text-gray-500">
										Faster, less intrusive
									</span>
								</div>
							</label>
							<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-steelBlue hover:shadow-sm">
								<input
									type="radio"
									value="full"
									checked={scanMode === "full"}
									onChange={() => setScanMode("full")}
									className="h-4 w-4 text-steelBlue border-gray-300 focus:ring-steelBlue"
									disabled={isSubmitting}
								/>
								<div className="ml-3">
									<span className="block font-medium text-gray-800">
										Full Scan
									</span>
									<span className="text-sm text-gray-500">
										Slower, more thorough
									</span>
								</div>
							</label>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Full scan includes port scanning and takes longer to complete
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
								I confirm that I have legal authority to scan this domain and
								understand that scanning websites without permission may violate
								laws and terms of service. I accept all legal responsibility for
								this scan.
							</span>
						</label>
					</div>

					<button
						type="submit"
						disabled={isSubmitting || !domain || !legalConfirmation}
						className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 bg-gray-800 hover:bg-black ${
							isSubmitting || !domain || !legalConfirmation
								? "bg-gray-300 cursor-not-allowed"
								: "steel-gradient hover:saffron-gradient shadow-md hover:shadow-lg"
						}`}
					>
						{isSubmitting ? "Scanning..." : "Scan Domain"}
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
									Full scans can take several minutes to complete, especially
									for domains with many subdomains or services.
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
							Scan Results for {results.domain}
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
							{/* Risk Distribution */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<RiskSummaryChart summary={results.summary} />
							</div>

							{/* Security Score */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
								<SecurityScoreChart summary={results.summary} />
							</div>

							{/* Security Profile Radar */}
							<div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 md:col-span-2 lg:col-span-1">
								<SecurityProfileChart results={results} />
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
								{/* Summary text */}
								<div className="mb-4 bg-white p-4 rounded-lg border border-gray-100">
									<p className="text-gray-700 whitespace-pre-line break-words">
										{results.summary?.text}
									</p>
								</div>

								{/* Detailed findings */}
								{results.summary?.findings &&
									results.summary.findings.length > 0 && (
										<div className="space-y-3">
											{results.summary.findings.map((finding, index) => (
												<div
													key={index}
													className={`rounded-lg p-4 ${
														finding.risk_level === "High"
															? "bg-red-50 border border-red-100"
															: finding.risk_level === "Medium"
															? "bg-amber-50 border border-amber-100"
															: "bg-emerald-50 border border-emerald-100"
													}`}
												>
													<div className="flex items-center justify-between mb-2">
														<h4 className="font-semibold flex items-center">
															<span
																className={`inline-block w-3 h-3 rounded-full mr-2 ${
																	finding.risk_level === "High"
																		? "bg-red-500"
																		: finding.risk_level === "Medium"
																		? "bg-amber-500"
																		: "bg-emerald-500"
																}`}
															></span>
															{finding.name}
														</h4>
														<span
															className={`text-xs font-medium px-2 py-1 rounded ${
																finding.risk_level === "High"
																	? "bg-red-100 text-red-800"
																	: finding.risk_level === "Medium"
																	? "bg-amber-100 text-amber-800"
																	: "bg-emerald-100 text-emerald-800"
															}`}
														>
															{finding.risk_level} Risk
														</span>
													</div>
													<p className="text-gray-700 mb-2 break-words">
														{finding.description}
													</p>
													{finding.details &&
														Object.keys(finding.details).length > 0 && (
															<div className="mt-2 bg-white bg-opacity-60 p-3 rounded border border-gray-100 text-sm">
																<details>
																	<summary className="font-medium cursor-pointer">
																		Technical Details
																	</summary>
																	<div className="mt-2 pl-4 border-l-2 border-gray-200 overflow-x-auto">
																		{renderObjectData(finding.details)}
																	</div>
																</details>
															</div>
														)}
												</div>
											))}
										</div>
									)}
							</div>
						)}
					</div>

					{/* Raw Data Sections */}
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<div className="steel-gradient text-white p-5">
							<h3 className="text-xl font-bold">Detailed Results</h3>
						</div>
						<div className="p-8 space-y-5">
							{[
								{ id: "whois", name: "WHOIS Information", icon: "📋" },
								{ id: "dns", name: "DNS Records", icon: "🔍" },
								{ id: "ssl", name: "SSL Certificate", icon: "🔒" },
								{ id: "http_headers", name: "HTTP Headers", icon: "📝" },
								{ id: "open_ports", name: "Open Ports", icon: "🚪" },
								{ id: "subdomains", name: "Subdomains", icon: "🌐" },
								{
									id: "robots_sitemap",
									name: "Robots & Sitemap",
									icon: "🤖",
								},
								{
									id: "directory_fingerprint",
									name: "Directory Scan",
									icon: "🗂️",
								},
								{ id: "rate_limit", name: "Rate Limiting", icon: "⏱️" },
								{
									id: "github_metadata",
									name: "GitHub Presence",
									icon: "🐙",
								},
								{ id: "ip_geolocation", name: "IP Geolocation", icon: "🗺️" },
							].map((section) => (
								<div
									key={section.id}
									className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
								>
									<button
										onClick={() => toggleSection(section.id)}
										className="w-full flex justify-between items-center p-5 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800"
									>
										<span className="flex items-center">
											<span className="mr-3 text-lg">{section.icon}</span>
											{section.name}
										</span>
										<span className="text-lg text-steelBlue flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
											{expandedSections.includes(section.id) ? "−" : "+"}
										</span>
									</button>

									{expandedSections.includes(section.id) && (
										<div className="p-5 text-sm bg-white border-t border-gray-100">
											{renderSectionContent(
												section.id,
												results[section.id as keyof ScanResults]
											)}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="max-w-3xl mx-auto mt-16 mb-12">
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="bg-gray-800 text-white p-6">
						<h2 className="text-2xl font-bold">About AI Recon Bot</h2>
					</div>
					<div className="p-8">
						<p className="mb-6 text-gray-700 leading-relaxed">
							AI Recon Bot is a powerful cybersecurity tool that scans domains
							for various surface-level risks, including:
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<ul className="space-y-3">
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">WHOIS data analysis</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											DNS records examination
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											SSL certificate verification
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											HTTP security headers check
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">Open ports detection</span>
									</li>
								</ul>
							</div>
							<div className="bg-gray-50 rounded-lg p-5 shadow-sm">
								<ul className="space-y-3">
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">Subdomain enumeration</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Rate limiting assessment
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											Directory exposure detection
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											GitHub metadata analysis
										</span>
									</li>
									<li className="flex items-center">
										<span className="mr-2 text-steelBlue">✓</span>
										<span className="text-gray-800">
											IP geolocation information
										</span>
									</li>
								</ul>
							</div>
						</div>
						<div className="mb-8">
							<p className="text-gray-700 leading-relaxed">
								Each finding is automatically tagged with a risk level (High,
								Medium, Low) for quick insights.
							</p>
						</div>
						<div className="saffron-gradient text-white p-6 rounded-lg shadow-md">
							<p className="font-semibold mb-3">⚠️ Legal Disclaimer:</p>
							<p className="text-sm leading-relaxed">
								This tool is in beta and intended for security research purposes
								only. Only scan domains you own or have explicit permission to
								test. Unauthorized scanning may violate computer fraud and abuse
								laws, terms of service agreements, and other regulations.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
