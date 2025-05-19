"use client";

import { useState, useRef } from "react";

interface Finding {
	id: string;
	tool: string;
	title: string;
	description: string;
	severity: "Critical" | "High" | "Medium" | "Low";
	cvss: number;
	category: string;
	affected_asset: string;
	evidence: string;
	remediation: string;
	effort: "Low" | "Medium" | "High";
	references: string[];
}

interface ExecutiveSummary {
	totalIssues: number;
	criticalIssues: number;
	highIssues: number;
	mediumIssues: number;
	lowIssues: number;
	riskScore: number;
	toolsUsed: string[];
	topFindings: Finding[];
	severityDistribution: Record<string, number>;
	categoryDistribution: Record<string, number>;
	scanDate: string;
}

interface ReportData {
	meta: {
		clientName: string;
		reportTitle: string;
		generated: string;
		generatedBy: string;
		exportFormat: string;
	};
	executiveSummary: ExecutiveSummary;
	findings: Finding[];
	remediationRoadmap: {
		quickWins: Finding[];
		longTermFixes: Finding[];
	};
}

interface ToolSelection {
	apiFuzzer: boolean;
	misconfigChecker: boolean;
	aiReconBot: boolean;
	formInputScanner: boolean;
	webAppPentester: boolean;
}

interface ReportConfig {
	includeExecutiveSummary: boolean;
	includeTechnicalDetails: boolean;
	includeRemediation: boolean;
	includeAppendices: boolean;
	exportFormat: string;
	clientName: string;
	clientLogo: null | File;
	reportTitle: string;
	targetUrl: string;
}

export default function AutomatedReportGeneratorPage() {
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState<ReportData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const [scanStatus, setScanStatus] = useState<Record<string, string>>({});
	const [selectedTools, setSelectedTools] = useState<ToolSelection>({
		apiFuzzer: false,
		misconfigChecker: false,
		aiReconBot: false,
		formInputScanner: false,
		webAppPentester: false,
	});

	const [reportConfig, setReportConfig] = useState<ReportConfig>({
		includeExecutiveSummary: true,
		includeTechnicalDetails: true,
		includeRemediation: true,
		includeAppendices: true,
		exportFormat: "pdf",
		clientName: "",
		clientLogo: null,
		reportTitle: "Security Assessment Report",
		targetUrl: "",
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setReportData(null);
		setScanStatus({});

		const formData = new FormData(e.currentTarget);
		const clientName = formData.get("clientName") as string;
		const reportTitle = formData.get("reportTitle") as string;
		const logoFile = formData.get("clientLogo") as File;
		const dateRange = formData.get("dateRange") as string;
		const reportFormat = formData.get("exportFormat") as string;
		const targetUrl = formData.get("targetUrl") as string;

		// URL validation
		if (!targetUrl) {
			setError("Please enter a target URL to scan");
			setLoading(false);
			return;
		}

		try {
			new URL(
				targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`
			);
		} catch (err) {
			setError(
				"Please enter a valid URL (e.g., example.com or https://example.com)"
			);
			setLoading(false);
			return;
		}

		// Check if at least one tool is selected
		const selectedToolsCount =
			Object.values(selectedTools).filter(Boolean).length;
		if (selectedToolsCount === 0) {
			setError(
				"Please select at least one security tool to include in the report"
			);
			setLoading(false);
			return;
		}

		// In a real implementation, this would call the backend APIs for each tool
		// Here we'll simulate the process with staged status updates

		// Update report config with the target URL
		const updatedConfig = {
			...reportConfig,
			clientName,
			reportTitle,
			targetUrl,
		};
		setReportConfig(updatedConfig);

		// Simulate running scans for each selected tool
		const runScans = async () => {
			const toolNameMap = {
				apiFuzzer: "API Fuzzer",
				misconfigChecker: "Misconfiguration Checker",
				aiReconBot: "AI Recon Bot",
				formInputScanner: "Form Input Scanner",
				webAppPentester: "Web App Pentester Pro",
			};

			// First, initialize scan status for all selected tools
			const initialStatus: Record<string, string> = {};
			Object.entries(selectedTools).forEach(([tool, isSelected]) => {
				if (isSelected) {
					initialStatus[tool] = "Initializing...";
				}
			});
			setScanStatus(initialStatus);

			// Simulate scan process for each tool
			for (const [tool, isSelected] of Object.entries(selectedTools)) {
				if (isSelected) {
					// Update status to scanning
					setScanStatus((prev) => ({
						...prev,
						[tool]: "Scanning...",
					}));

					// Simulate scan duration (1-3 seconds)
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 + Math.random() * 2000)
					);

					// Update status to completed
					setScanStatus((prev) => ({
						...prev,
						[tool]: "Completed",
					}));
				}
			}

			// Generate mock report data with the target URL
			const mockReportData = generateMockReportData(
				clientName,
				reportTitle,
				selectedTools,
				updatedConfig
			);

			setReportData(mockReportData);
			setLoading(false);
		};

		// Start the scan process
		runScans();
	};

	const handleToolSelection = (tool: string) => {
		setSelectedTools({
			...selectedTools,
			[tool]: !selectedTools[tool as keyof typeof selectedTools],
		});
	};

	const handleConfigChange = (setting: string, value: boolean | string) => {
		setReportConfig({
			...reportConfig,
			[setting]: value,
		});
	};

	const handleFileChange = () => {
		setError(null);
	};

	// This would be part of an API call in a real implementation
	const generateMockReportData = (
		clientName: string,
		reportTitle: string,
		selectedTools: ToolSelection,
		config: ReportConfig
	): ReportData => {
		const currentDate = new Date().toISOString();
		const targetUrl = config.targetUrl || "example.com";
		const parsedUrl = new URL(
			targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`
		);
		const hostname = parsedUrl.hostname;
		const baseUrl = `${parsedUrl.protocol}//${hostname}`;

		// Generate executive summary data - initialize with zeros
		const execSummary: ExecutiveSummary = {
			totalIssues: 0,
			criticalIssues: 0,
			highIssues: 0,
			mediumIssues: 0,
			lowIssues: 0,
			riskScore: 0,
			toolsUsed: [],
			topFindings: [],
			severityDistribution: {},
			categoryDistribution: {},
			scanDate: currentDate,
		};

		// Generate findings from each selected tool
		const allFindings: Finding[] = [];

		if (selectedTools.apiFuzzer) {
			const apiFuzzerFindings: Finding[] = [
				{
					id: "api-001",
					tool: "API Fuzzer",
					title: "GraphQL Introspection Enabled",
					description: `GraphQL introspection is enabled on ${hostname}, allowing attackers to discover API schema details.`,
					severity: "High" as const,
					cvss: 7.5,
					category: "Information Disclosure",
					affected_asset: `${baseUrl}/graphql`,
					evidence: "Introspection query returned full schema details",
					remediation:
						"Disable GraphQL introspection in production environments",
					effort: "Low" as const,
					references: [
						"https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-API_Testing/01-Testing_GraphQL",
					],
				},
				{
					id: "api-002",
					tool: "API Fuzzer",
					title: "SQL Injection in API Endpoint",
					description: `The ${baseUrl}/api/users endpoint is vulnerable to SQL injection via the 'sort' parameter.`,
					severity: "Critical" as const,
					cvss: 9.8,
					category: "Injection",
					affected_asset: `${baseUrl}/api/users?sort=name`,
					evidence:
						"Request with sort=name')) UNION SELECT username,password FROM users-- returned database content",
					remediation: "Implement parameterized queries and input validation",
					effort: "Medium" as const,
					references: ["https://owasp.org/www-community/attacks/SQL_Injection"],
				},
			];
			allFindings.push(...apiFuzzerFindings);
			execSummary.toolsUsed.push("API Fuzzer");
			execSummary.criticalIssues += apiFuzzerFindings.filter(
				(f) => f.severity === "Critical"
			).length;
			execSummary.highIssues += apiFuzzerFindings.filter(
				(f) => f.severity === "High"
			).length;
		}

		if (selectedTools.misconfigChecker) {
			const misconfigFindings = [
				{
					id: "misconfig-001",
					tool: "Misconfiguration Checker",
					title: "Missing HTTP Security Headers",
					description: `${hostname} is missing critical security headers including Content-Security-Policy and X-Frame-Options.`,
					severity: "High" as const,
					cvss: 6.5,
					category: "Security Misconfiguration",
					affected_asset: baseUrl,
					evidence: "HTTP response headers analysis",
					remediation:
						"Implement recommended security headers in web server configuration",
					effort: "Low" as const,
					references: ["https://owasp.org/www-project-secure-headers/"],
				},
				{
					id: "misconfig-002",
					tool: "Misconfiguration Checker",
					title: "Information Disclosure in Error Pages",
					description: `Error pages on ${hostname} reveal sensitive information including stack traces and backend technologies.`,
					severity: "Medium" as const,
					cvss: 5.3,
					category: "Information Disclosure",
					affected_asset: `${baseUrl}/error-trigger`,
					evidence: "Stack trace visible in 500 error response",
					remediation:
						"Implement custom error pages that don't reveal implementation details",
					effort: "Low" as const,
					references: [
						"https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server",
					],
				},
				{
					id: "misconfig-003",
					tool: "Misconfiguration Checker",
					title: "Insecure Cookie Settings",
					description: `Cookies on ${hostname} are missing Secure and HttpOnly flags.`,
					severity: "Medium" as const,
					cvss: 5.8,
					category: "Security Misconfiguration",
					affected_asset: baseUrl,
					evidence: "Cookie analysis in HTTP responses",
					remediation:
						"Set Secure and HttpOnly flags for all sensitive cookies",
					effort: "Low" as const,
					references: [
						"https://owasp.org/www-community/HttpOnly",
						"https://owasp.org/www-community/controls/SecureFlag",
					],
				},
			];
			allFindings.push(...misconfigFindings);
			execSummary.toolsUsed.push("Misconfiguration Checker");
			execSummary.highIssues += misconfigFindings.filter(
				(f) => f.severity === "High"
			).length;
			execSummary.mediumIssues += misconfigFindings.filter(
				(f) => f.severity === "Medium"
			).length;
		}

		if (selectedTools.aiReconBot) {
			const reconFindings = [
				{
					id: "recon-001",
					tool: "AI Recon Bot",
					title: "Subdomain with Out-of-date Software",
					description: `Discovered subdomain test.${hostname} running an outdated version of Apache (2.4.29) with known vulnerabilities.`,
					severity: "High" as const,
					cvss: 7.4,
					category: "Outdated Components",
					affected_asset: `test.${hostname}`,
					evidence: "Server header: Apache/2.4.29 (Ubuntu)",
					remediation: "Update Apache to the latest stable version",
					effort: "Medium" as const,
					references: [
						"https://httpd.apache.org/security/vulnerabilities_24.html",
					],
				},
				{
					id: "recon-002",
					tool: "AI Recon Bot",
					title: "Exposed Git Repository",
					description: `Git repository is publicly accessible at ${baseUrl}/.git/`,
					severity: "Critical" as const,
					cvss: 8.2,
					category: "Information Disclosure",
					affected_asset: `${baseUrl}/.git/`,
					evidence: "Directory listing of .git folder is accessible",
					remediation:
						"Block access to .git directories in web server configuration",
					effort: "Low" as const,
					references: [
						"https://en.internetwache.org/dont-publicly-expose-git-or-how-we-downloaded-your-websites-sourcecode-an-analysis-of-alexas-1m-28-07-2015/",
					],
				},
			];
			allFindings.push(...reconFindings);
			execSummary.toolsUsed.push("AI Recon Bot");
			execSummary.criticalIssues += reconFindings.filter(
				(f) => f.severity === "Critical"
			).length;
			execSummary.highIssues += reconFindings.filter(
				(f) => f.severity === "High"
			).length;
		}

		if (selectedTools.formInputScanner) {
			const formFindings = [
				{
					id: "form-001",
					tool: "Form Input Scanner",
					title: "Cross-Site Scripting (XSS) in Contact Form",
					description: `The 'name' field in the contact form on ${baseUrl}/contact is vulnerable to reflected XSS attacks.`,
					severity: "High" as const,
					cvss: 6.1,
					category: "XSS",
					affected_asset: `${baseUrl}/contact`,
					evidence:
						"Payload <script>alert('XSS')</script> was executed when submitted",
					remediation: "Implement proper input validation and output encoding",
					effort: "Medium" as const,
					references: ["https://owasp.org/www-community/attacks/xss/"],
				},
				{
					id: "form-002",
					tool: "Form Input Scanner",
					title: "Insecure Direct Object Reference (IDOR)",
					description: `The profile page on ${hostname} allows access to other user profiles by changing the 'id' parameter.`,
					severity: "Medium" as const,
					cvss: 5.4,
					category: "Broken Access Control",
					affected_asset: `${baseUrl}/profile?id=123`,
					evidence: "Changing id parameter allowed access to other user data",
					remediation:
						"Implement proper authorization checks for user-specific data",
					effort: "Medium" as const,
					references: [
						"https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html",
					],
				},
			];
			allFindings.push(...formFindings);
			execSummary.toolsUsed.push("Form Input Scanner");
			execSummary.highIssues += formFindings.filter(
				(f) => f.severity === "High"
			).length;
			execSummary.mediumIssues += formFindings.filter(
				(f) => f.severity === "Medium"
			).length;
		}

		if (selectedTools.webAppPentester) {
			const webAppFindings = [
				{
					id: "webapp-001",
					tool: "Web App Pentester Pro",
					title: "Broken Authentication - Weak Password Policy",
					description: `The application at ${baseUrl} allows weak passwords and has no account lockout mechanism.`,
					severity: "High" as const,
					cvss: 7.2,
					category: "Broken Authentication",
					affected_asset: `${baseUrl}/login`,
					evidence: "Password '123456' was accepted as valid",
					remediation: "Implement a strong password policy and account lockout",
					effort: "Medium" as const,
					references: [
						"https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication",
					],
				},
				{
					id: "webapp-002",
					tool: "Web App Pentester Pro",
					title: "Sensitive Data Exposure - Plain Text Credentials",
					description: `Login credentials on ${hostname} are transmitted in plain text over HTTP.`,
					severity: "Critical" as const,
					cvss: 9.1,
					category: "Sensitive Data Exposure",
					affected_asset: `http://${hostname}/login`,
					evidence: "Username and password visible in HTTP request",
					remediation:
						"Enforce HTTPS for all pages and implement proper encryption",
					effort: "Medium" as const,
					references: [
						"https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure",
					],
				},
				{
					id: "webapp-003",
					tool: "Web App Pentester Pro",
					title: "Cross-Site Request Forgery (CSRF)",
					description: `The application is vulnerable to CSRF in the account settings page at ${baseUrl}/account/settings.`,
					severity: "Medium" as const,
					cvss: 5.8,
					category: "CSRF",
					affected_asset: `${baseUrl}/account/settings`,
					evidence: "No CSRF token validated when changing email address",
					remediation:
						"Implement CSRF tokens for all state-changing operations",
					effort: "Medium" as const,
					references: ["https://owasp.org/www-community/attacks/csrf"],
				},
			];
			allFindings.push(...webAppFindings);
			execSummary.toolsUsed.push("Web App Pentester Pro");
			execSummary.criticalIssues += webAppFindings.filter(
				(f) => f.severity === "Critical"
			).length;
			execSummary.highIssues += webAppFindings.filter(
				(f) => f.severity === "High"
			).length;
			execSummary.mediumIssues += webAppFindings.filter(
				(f) => f.severity === "Medium"
			).length;
		}

		// Calculate total issues directly from the findings count
		execSummary.totalIssues = allFindings.length;

		// Ensure low issues count is calculated from actual findings
		execSummary.lowIssues = allFindings.filter(
			(f) => f.severity === "Low"
		).length;

		// Calculate risk score dynamically based on actual findings
		// Use a weighted formula with severity counts
		execSummary.riskScore = Math.min(
			100,
			Math.round(
				(execSummary.criticalIssues * 10 +
					execSummary.highIssues * 5 +
					execSummary.mediumIssues * 2 +
					execSummary.lowIssues * 0.5) *
					(10 / Math.max(1, allFindings.length))
			)
		);

		// Create severity distribution directly from counts
		execSummary.severityDistribution = {
			Critical: execSummary.criticalIssues,
			High: execSummary.highIssues,
			Medium: execSummary.mediumIssues,
			Low: execSummary.lowIssues,
		};

		// Create category distribution by counting findings per category
		const categories: Record<string, number> = {};
		allFindings.forEach((finding) => {
			if (!categories[finding.category]) {
				categories[finding.category] = 0;
			}
			categories[finding.category]++;
		});
		execSummary.categoryDistribution = categories;

		// Top findings (critical and high only)
		execSummary.topFindings = allFindings
			.filter((f) => f.severity === "Critical" || f.severity === "High")
			.sort((a, b) => b.cvss - a.cvss)
			.slice(0, 5);

		// Create remediation roadmap
		const quickWins = allFindings
			.filter((f) => f.effort === "Low")
			.sort((a, b) => {
				const severityOrder: Record<string, number> = {
					Critical: 4,
					High: 3,
					Medium: 2,
					Low: 1,
				};
				return severityOrder[b.severity] - severityOrder[a.severity];
			})
			.slice(0, 5);

		const longTermFixes = allFindings
			.filter((f) => f.effort !== "Low")
			.sort((a, b) => {
				const severityOrder: Record<string, number> = {
					Critical: 4,
					High: 3,
					Medium: 2,
					Low: 1,
				};
				return severityOrder[b.severity] - severityOrder[a.severity];
			})
			.slice(0, 5);

		// Return the complete report data
		return {
			meta: {
				clientName: clientName || "Example Organization",
				reportTitle: reportTitle || "Security Assessment Report",
				generated: currentDate,
				generatedBy: "FlexGen Automated Report Generator",
				exportFormat: config.exportFormat,
			},
			executiveSummary: execSummary,
			findings: allFindings,
			remediationRoadmap: {
				quickWins,
				longTermFixes,
			},
		};
	};

	const renderReportPreview = () => {
		if (!reportData) return null;

		const { meta, executiveSummary, findings, remediationRoadmap } = reportData;

		return (
			<div className="bg-white rounded-lg shadow-md p-6 mt-8">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-bold">Report Preview</h2>

					<div className="flex space-x-2">
						<button
							className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black transition-colors text-sm flex items-center"
							onClick={() =>
								alert(
									"In a real implementation, this would download the report"
								)
							}
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
							Download {meta.exportFormat.toUpperCase()}
						</button>
					</div>
				</div>

				{/* Cover Page Preview */}
				<div className="bg-gray-50 p-6 border rounded-lg mb-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{meta.reportTitle}
						</h1>
						<p className="text-xl text-gray-600 mb-6">
							Prepared for {meta.clientName}
						</p>
						<div className="border-t border-b border-gray-300 py-4 my-4">
							<p className="text-gray-600">
								Generated on {new Date(meta.generated).toLocaleDateString()}
							</p>
							<p className="text-gray-500 text-sm mt-1">
								by FlexGen Automated Report Generator
							</p>
						</div>

						<div className="w-32 h-32 mx-auto mt-4 bg-gray-200 rounded-lg flex items-center justify-center">
							<p className="text-gray-400 text-sm">Client Logo</p>
						</div>
					</div>
				</div>

				{/* Executive Summary */}
				{reportConfig.includeExecutiveSummary && (
					<div className="mb-8">
						<h3 className="text-xl font-semibold mb-4 border-b pb-2">
							Executive Summary
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-gray-500 text-sm">Security Risk Score</p>
								<div className="flex items-end">
									<p
										className="text-3xl font-bold"
										style={{
											color:
												executiveSummary.riskScore > 75
													? "#e53e3e"
													: executiveSummary.riskScore > 50
													? "#dd6b20"
													: executiveSummary.riskScore > 25
													? "#d69e2e"
													: "#38a169",
										}}
									>
										{executiveSummary.riskScore}/100
									</p>
									<p className="text-gray-500 ml-2 mb-1">
										(
										{executiveSummary.riskScore > 75
											? "Critical"
											: executiveSummary.riskScore > 50
											? "High"
											: executiveSummary.riskScore > 25
											? "Medium"
											: "Low"}
										)
									</p>
								</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-gray-500 text-sm">Total Findings</p>
								<p className="text-3xl font-bold text-gray-800">
									{executiveSummary.totalIssues}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-gray-500 text-sm">Scan Date</p>
								<p className="text-lg font-medium">
									{new Date(executiveSummary.scanDate).toLocaleDateString()}
								</p>
							</div>
						</div>

						{/* Methodology Section - Add explanation of calculation */}
						<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r my-6">
							<h4 className="font-medium text-blue-800 mb-2">
								How This Report is Calculated
							</h4>
							<div className="text-sm text-blue-700">
								<p className="mb-2">
									<span className="font-medium">Security Risk Score:</span>{" "}
									Calculated based on the weighted severity of findings:
								</p>
								<ul className="list-disc pl-5 mb-3 space-y-1">
									<li>Critical issues: 10 points each</li>
									<li>High issues: 5 points each</li>
									<li>Medium issues: 2 points each</li>
									<li>Low issues: 0.5 points each</li>
								</ul>
								<p>
									The final score is scaled based on the total number of
									findings to provide a balanced assessment between 0-100.
									Higher scores indicate greater security risk.
								</p>
								<p className="mt-2">
									<span className="font-medium">Severity Classification:</span>{" "}
									Issues are classified according to the potential impact and
									exploitability of the vulnerability, following
									industry-standard practices and CVSS scoring.
								</p>
							</div>
						</div>

						{/* More Executive Summary content would go here */}
					</div>
				)}

				{/* Technical Details */}
				{reportConfig.includeTechnicalDetails && findings.length > 0 && (
					<div className="mb-8">
						<h3 className="text-xl font-semibold mb-4 border-b pb-2">
							Technical Details
						</h3>

						<div className="space-y-4">
							{findings.slice(0, 3).map((finding, index) => (
								<div key={index} className="border rounded-lg overflow-hidden">
									<div
										className={`p-4 ${
											finding.severity === "Critical"
												? "bg-red-50 border-b border-red-100"
												: finding.severity === "High"
												? "bg-orange-50 border-b border-orange-100"
												: finding.severity === "Medium"
												? "bg-yellow-50 border-b border-yellow-100"
												: "bg-blue-50 border-b border-blue-100"
										}`}
									>
										<div className="flex justify-between">
											<h4 className="font-medium">{finding.title}</h4>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													finding.severity === "Critical"
														? "bg-red-100 text-red-800"
														: finding.severity === "High"
														? "bg-orange-100 text-orange-800"
														: finding.severity === "Medium"
														? "bg-yellow-100 text-yellow-800"
														: "bg-blue-100 text-blue-800"
												}`}
											>
												{finding.severity} (CVSS: {finding.cvss})
											</span>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											<span className="font-medium">Tool:</span> {finding.tool}{" "}
											| <span className="font-medium">Category:</span>{" "}
											{finding.category}
										</p>
									</div>
									<div className="p-4">
										{/* Technical detail content would go here */}
										<p className="text-sm text-gray-600">
											{finding.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Remediation Roadmap */}
				{reportConfig.includeRemediation && (
					<div className="mb-8">
						<h3 className="text-xl font-semibold mb-4 border-b pb-2">
							Remediation Roadmap
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-medium text-gray-800 mb-3">Quick Wins</h4>
								<div className="bg-green-50 p-4 rounded-lg border border-green-100">
									{/* Remediation content would go here */}
									<p className="text-sm text-gray-600">
										Prioritized quick wins would be listed here
									</p>
								</div>
							</div>

							<div>
								<h4 className="font-medium text-gray-800 mb-3">
									Long-term Improvements
								</h4>
								<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
									<p className="text-sm text-gray-600">
										Strategic improvements would be listed here
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	// Add the render method for scan status
	const renderScanStatus = () => {
		if (Object.keys(scanStatus).length === 0) return null;

		return (
			<div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
				<h3 className="text-xl font-semibold mb-4">Scan Progress</h3>
				<div className="space-y-4">
					{Object.entries(scanStatus).map(([tool, status]) => {
						const toolDisplayMap: Record<string, string> = {
							apiFuzzer: "API Fuzzer",
							misconfigChecker: "Misconfiguration Checker",
							aiReconBot: "AI Recon Bot",
							formInputScanner: "Form Input Scanner",
							webAppPentester: "Web App Pentester Pro",
						};

						const statusColorMap: Record<string, string> = {
							"Initializing...": "bg-blue-100 text-blue-800",
							"Scanning...": "bg-yellow-100 text-yellow-800",
							Completed: "bg-green-100 text-green-800",
							Failed: "bg-red-100 text-red-800",
						};

						return (
							<div key={tool} className="flex justify-between items-center">
								<span className="font-medium">
									{toolDisplayMap[tool] || tool}
								</span>
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${
										statusColorMap[status] || "bg-gray-100"
									}`}
								>
									{status}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-3">Automated Report Generator</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Consolidate security findings from all FlexGen tools into
					comprehensive, branded reports with executive insights and technical
					details
				</p>
				<button
					onClick={() => setShowDetails(!showDetails)}
					className="mt-4 text-blue-600 hover:text-blue-800 transition-colors font-medium"
				>
					{showDetails ? "Hide Details" : "Learn More About This Tool"}
				</button>
			</div>

			{/* Tool description details - will be expanded in part 2 */}
			{showDetails && (
				<div className="max-w-4xl mx-auto mb-12 bg-white rounded-lg shadow-md overflow-hidden">
					<div className="bg-gray-50 p-6 border-b border-gray-200">
						<h2 className="text-2xl font-bold text-gray-800">
							About Automated Report Generator
						</h2>
						<p className="mt-2 text-gray-600">
							The Automated Report Generator consolidates findings from all
							FlexGen security tools into comprehensive, actionable reports for
							both technical and executive audiences.
						</p>
					</div>

					<div className="p-6">
						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Key Features
							</h3>
							<ul className="space-y-2 list-disc pl-5 text-gray-600">
								<li>
									<span className="font-medium">Data Consolidation:</span>{" "}
									Automatically aggregates findings from all FlexGen security
									tools
								</li>
								<li>
									<span className="font-medium">Executive Summaries:</span>{" "}
									High-level overview of security posture with visual
									representation
								</li>
								<li>
									<span className="font-medium">Technical Analysis:</span>{" "}
									Detailed breakdown of findings with evidence and CVSS scores
								</li>
								<li>
									<span className="font-medium">Remediation Roadmap:</span>{" "}
									Prioritized action items sorted by impact and implementation
									effort
								</li>
								<li>
									<span className="font-medium">Custom Branding:</span>{" "}
									Incorporate your organization's logo and styling
								</li>
								<li>
									<span className="font-medium">Multiple Export Formats:</span>{" "}
									PDF, interactive HTML, and raw data exports
								</li>
							</ul>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold mb-3 text-gray-800">
								Report Sections
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Executive Summary
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Overall security posture</li>
										<li>• Risk score heatmap</li>
										<li>• Issue distribution by category</li>
										<li>• Business impact assessment</li>
										<li>• Key findings overview</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Technical Details
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Tool-wise findings breakdown</li>
										<li>• Asset-wise vulnerability mapping</li>
										<li>• CVSS scores and severity ratings</li>
										<li>• Evidence capture and reproduction steps</li>
										<li>• Reference to related CVEs</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">
										Remediation Roadmap
									</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Prioritized action items</li>
										<li>• "Quick Win" recommendations</li>
										<li>• Long-term security improvements</li>
										<li>• Step-by-step remediation guidance</li>
										<li>• Implementation effort estimates</li>
									</ul>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-medium text-gray-800">Appendices</h4>
									<ul className="mt-1 text-sm space-y-1">
										<li>• Raw scan data</li>
										<li>• Tool configurations</li>
										<li>• Security glossary</li>
										<li>• Scan metadata (dates, versions)</li>
										<li>• Methodology reference</li>
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
									<span className="font-medium">Select your data sources</span>{" "}
									by choosing which FlexGen security tool findings to include
								</li>
								<li>
									<span className="font-medium">
										Configure your report settings
									</span>{" "}
									including sections, client information, and export format
								</li>
								<li>
									<span className="font-medium">Generate the report</span> to
									consolidate findings, calculate risk scores, and create
									visualizations
								</li>
								<li>
									<span className="font-medium">Preview and export</span> your
									branded security report in your preferred format
								</li>
							</ol>
							<div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
								<p>
									<span className="font-medium">Pro Tip:</span> For
									comprehensive security assessments, include findings from all
									available FlexGen tools to get a complete view of your
									security posture.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Target URL field */}
					<div>
						<h3 className="text-xl font-semibold mb-4">Target URL</h3>
						<div>
							<label
								htmlFor="targetUrl"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Website or Application URL to Scan
							</label>
							<input
								type="text"
								id="targetUrl"
								name="targetUrl"
								value={reportConfig.targetUrl}
								onChange={(e) =>
									handleConfigChange("targetUrl", e.target.value)
								}
								className="w-full p-2 border border-gray-300 rounded-md"
								placeholder="https://example.com"
							/>
							<p className="mt-1.5 text-xs text-gray-500">
								Enter the root domain of the application you want to scan (e.g.,
								example.com)
							</p>
						</div>
					</div>

					{/* Data Sources */}
					<div className="border-t pt-8">
						<h3 className="text-xl font-semibold mb-4">1. Data Sources</h3>
						<p className="text-sm text-gray-600 mb-4">
							Select which security tools to run against the target URL
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="apiFuzzer"
									checked={selectedTools.apiFuzzer}
									onChange={() => handleToolSelection("apiFuzzer")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="apiFuzzer"
										className="block font-medium cursor-pointer"
									>
										API Fuzzer
									</label>
									<p className="text-sm text-gray-500">
										API security issues and GraphQL endpoint vulnerabilities
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="misconfigChecker"
									checked={selectedTools.misconfigChecker}
									onChange={() => handleToolSelection("misconfigChecker")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="misconfigChecker"
										className="block font-medium cursor-pointer"
									>
										Misconfiguration Checker
									</label>
									<p className="text-sm text-gray-500">
										Server and application security misconfigurations
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="aiReconBot"
									checked={selectedTools.aiReconBot}
									onChange={() => handleToolSelection("aiReconBot")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="aiReconBot"
										className="block font-medium cursor-pointer"
									>
										AI Recon Bot
									</label>
									<p className="text-sm text-gray-500">
										Surface-level domain risks and exposed assets
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="formInputScanner"
									checked={selectedTools.formInputScanner}
									onChange={() => handleToolSelection("formInputScanner")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="formInputScanner"
										className="block font-medium cursor-pointer"
									>
										Form Input Scanner
									</label>
									<p className="text-sm text-gray-500">
										Web form injection vulnerabilities and input validation
										issues
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="webAppPentester"
									checked={selectedTools.webAppPentester}
									onChange={() => handleToolSelection("webAppPentester")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="webAppPentester"
										className="block font-medium cursor-pointer"
									>
										Web App Pentester Pro
									</label>
									<p className="text-sm text-gray-500">
										Comprehensive web application security findings
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Report Configuration */}
					<div className="border-t pt-8">
						<h3 className="text-xl font-semibold mb-4">
							2. Report Configuration
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label
									htmlFor="clientName"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Client/Organization Name
								</label>
								<input
									type="text"
									id="clientName"
									name="clientName"
									value={reportConfig.clientName}
									onChange={(e) =>
										handleConfigChange("clientName", e.target.value)
									}
									className="w-full p-2 border border-gray-300 rounded-md"
									placeholder="Example Corp."
								/>
							</div>
							<div>
								<label
									htmlFor="reportTitle"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Report Title
								</label>
								<input
									type="text"
									id="reportTitle"
									name="reportTitle"
									value={reportConfig.reportTitle}
									onChange={(e) =>
										handleConfigChange("reportTitle", e.target.value)
									}
									className="w-full p-2 border border-gray-300 rounded-md"
									placeholder="Security Assessment Report"
								/>
							</div>
							<div>
								<label
									htmlFor="clientLogo"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Client Logo (Optional)
								</label>
								<input
									type="file"
									id="clientLogo"
									name="clientLogo"
									ref={fileInputRef}
									onChange={handleFileChange}
									className="w-full p-2 border border-gray-300 rounded-md"
									accept="image/png, image/jpeg, image/svg+xml"
								/>
								<p className="mt-1.5 text-xs text-gray-500">
									Recommended: PNG or SVG with transparent background (max 1MB)
								</p>
							</div>
							<div>
								<label
									htmlFor="dateRange"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Date Range for Findings
								</label>
								<input
									type="text"
									id="dateRange"
									name="dateRange"
									className="w-full p-2 border border-gray-300 rounded-md"
									placeholder="Last 30 days"
								/>
								<p className="mt-1.5 text-xs text-gray-500">
									Only include findings from this time period
								</p>
							</div>
						</div>
					</div>

					{/* Report Sections */}
					<div className="border-t pt-8">
						<h3 className="text-xl font-semibold mb-4">3. Report Sections</h3>
						<p className="text-sm text-gray-600 mb-4">
							Select which sections to include in your report
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="executiveSummary"
									checked={reportConfig.includeExecutiveSummary}
									onChange={() =>
										handleConfigChange(
											"includeExecutiveSummary",
											!reportConfig.includeExecutiveSummary
										)
									}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="executiveSummary"
										className="block font-medium cursor-pointer"
									>
										Executive Summary
									</label>
									<p className="text-sm text-gray-500">
										High-level overview with key metrics and visualizations
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="technicalDetails"
									checked={reportConfig.includeTechnicalDetails}
									onChange={() =>
										handleConfigChange(
											"includeTechnicalDetails",
											!reportConfig.includeTechnicalDetails
										)
									}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="technicalDetails"
										className="block font-medium cursor-pointer"
									>
										Technical Details
									</label>
									<p className="text-sm text-gray-500">
										Detailed findings with evidence and CVSS scores
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="remediation"
									checked={reportConfig.includeRemediation}
									onChange={() =>
										handleConfigChange(
											"includeRemediation",
											!reportConfig.includeRemediation
										)
									}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="remediation"
										className="block font-medium cursor-pointer"
									>
										Remediation Roadmap
									</label>
									<p className="text-sm text-gray-500">
										Prioritized action items with implementation guidance
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3">
								<input
									type="checkbox"
									id="appendices"
									checked={reportConfig.includeAppendices}
									onChange={() =>
										handleConfigChange(
											"includeAppendices",
											!reportConfig.includeAppendices
										)
									}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="appendices"
										className="block font-medium cursor-pointer"
									>
										Appendices & Raw Data
									</label>
									<p className="text-sm text-gray-500">
										Raw findings, scan metadata, and reference materials
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Export Options */}
					<div className="border-t pt-8">
						<h3 className="text-xl font-semibold mb-4">4. Export Options</h3>
						<div className="flex flex-wrap gap-4">
							<div className="border rounded-lg p-4 flex items-start space-x-3 min-w-[200px]">
								<input
									type="radio"
									id="formatPDF"
									name="exportFormat"
									value="pdf"
									checked={reportConfig.exportFormat === "pdf"}
									onChange={() => handleConfigChange("exportFormat", "pdf")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="formatPDF"
										className="block font-medium cursor-pointer"
									>
										PDF Document
									</label>
									<p className="text-sm text-gray-500">
										Print-friendly, paginated
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3 min-w-[200px]">
								<input
									type="radio"
									id="formatHTML"
									name="exportFormat"
									value="html"
									checked={reportConfig.exportFormat === "html"}
									onChange={() => handleConfigChange("exportFormat", "html")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="formatHTML"
										className="block font-medium cursor-pointer"
									>
										Interactive HTML
									</label>
									<p className="text-sm text-gray-500">
										Clickable elements, filterable
									</p>
								</div>
							</div>
							<div className="border rounded-lg p-4 flex items-start space-x-3 min-w-[200px]">
								<input
									type="radio"
									id="formatJSON"
									name="exportFormat"
									value="json"
									checked={reportConfig.exportFormat === "json"}
									onChange={() => handleConfigChange("exportFormat", "json")}
									className="mt-1"
								/>
								<div>
									<label
										htmlFor="formatJSON"
										className="block font-medium cursor-pointer"
									>
										Raw JSON Data
									</label>
									<p className="text-sm text-gray-500">
										For further processing
									</p>
								</div>
							</div>
						</div>
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
						{loading ? "Running Scans..." : "Run Scans & Generate Report"}
					</button>
				</form>
			</div>

			{loading && (
				<div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-600">Running security scans...</p>
					<p className="text-gray-500 text-sm mt-2">
						This may take a few minutes as we analyze the target URL
					</p>
				</div>
			)}

			{/* Render scan status */}
			{renderScanStatus()}

			{renderReportPreview()}
		</div>
	);
}
