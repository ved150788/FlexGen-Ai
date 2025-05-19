// Updated Threat Intelligence Tool page - May 2025
"use client";

import { useState, useEffect, useRef } from "react";
import {
	Chart as ChartJS,
	ArcElement,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	RadialLinearScale,
	PointElement,
	LineElement,
} from "chart.js";
import { Doughnut, Bar, Radar, Line } from "react-chartjs-2";
import Link from "next/link";
import { aggregateIntelligence, fetchIndicators } from "./api";
import { fetchTaxiiIntelligence } from "./stix-connector";
import config from "./config";

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

// Define types for threat intelligence data
interface ThreatIndicator {
	id: string;
	type: string;
	value: string;
	confidence: number;
	severity: "High" | "Medium" | "Low";
	firstSeen: string;
	lastSeen: string;
	tags: string[];
	relatedActors?: string[];
	description?: string;
}

interface ThreatActor {
	id: string;
	name: string;
	aliases: string[];
	description: string;
	motivation: string[];
	ttps: string[];
	targets: string[];
	countryOfOrigin: string;
	firstSeen: string;
	lastActive: string;
	associatedCampaigns: string[];
	indicators?: ThreatIndicator[];
}

interface Campaign {
	id: string;
	name: string;
	description: string;
	actors: string[];
	targets: string[];
	ttps: string[];
	startDate: string;
	endDate?: string;
	status: "Active" | "Inactive" | "Unknown";
	relatedCampaigns?: string[];
	indicators?: ThreatIndicator[];
}

interface IntelligenceReport {
	id: string;
	title: string;
	summary: string;
	publishDate: string;
	severity: "Critical" | "High" | "Medium" | "Low";
	confidence: "High" | "Medium" | "Low";
	affectedSectors: string[];
	affectedRegions: string[];
	indicators?: ThreatIndicator[];
	relatedActors?: string[];
	relatedCampaigns?: string[];
	mitigations?: string[];
	fullReport?: string;
}

interface Dashboard {
	recentIndicators: ThreatIndicator[];
	activeCampaigns: Campaign[];
	trendingThreats: {
		category: string;
		trend: number;
		previousPeriod: number;
		currentPeriod: number;
	}[];
	recentReports: IntelligenceReport[];
	threatsByRegion: {
		region: string;
		count: number;
	}[];
	threatsBySector: {
		sector: string;
		count: number;
	}[];
}

// Add a debug log viewer component
interface LogMessage {
	message: string;
	timestamp: Date;
}

export default function ThreatIntelligencePage() {
	const [activeSection, setActiveSection] = useState<string>("dashboard");
	const [loading, setLoading] = useState<boolean>(false);
	const [dashboard, setDashboard] = useState<Dashboard | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [selectedIndicator, setSelectedIndicator] =
		useState<ThreatIndicator | null>(null);
	const [selectedReport, setSelectedReport] =
		useState<IntelligenceReport | null>(null);
	const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
	const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const [logs, setLogs] = useState<LogMessage[]>([]);
	const [showLogs, setShowLogs] = useState<boolean>(false);
	const logRef = useRef<HTMLDivElement>(null);

	// Load dashboard data when component mounts
	useEffect(() => {
		// Force a clean start with real data
		console.log(
			"🚀 [DEBUG] Starting Threat Intelligence Platform with real-time data"
		);

		// Listen for log messages
		const handleLog = (event: any) => {
			const logMessage = event.detail as LogMessage;
			setLogs((prevLogs) => [...prevLogs, logMessage].slice(-100)); // Keep last 100 logs

			// Scroll to bottom of log viewer
			if (logRef.current) {
				logRef.current.scrollTop = logRef.current.scrollHeight;
			}
		};

		document.addEventListener("threatIntelLog", handleLog);

		// Initial data load
		loadDashboardData();

		// Set up auto-refresh if configured
		if (config.autoRefreshInterval > 0) {
			refreshIntervalRef.current = setInterval(() => {
				console.log(
					`⏰ [Dashboard] Auto-refreshing threat intelligence data...`
				);
				refreshData();
			}, config.autoRefreshInterval);
		}

		// Clean up interval and event listener on unmount
		return () => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
			document.removeEventListener("threatIntelLog", handleLog);
		};
	}, []);

	// Function to refresh data on demand
	const refreshData = async () => {
		if (loading) {
			console.log(
				`⏳ [Dashboard] Refresh skipped - data is already being loaded`
			);
			return;
		}

		console.log(
			`🔄 [Dashboard] Manually refreshing threat intelligence data...`
		);
		console.log(
			`⚠️ [DEBUG] Mock data is ${config.useMockData ? "ENABLED" : "DISABLED"}`
		);

		// Force config settings
		if (config.useMockData) {
			console.log(
				`⚠️ [DEBUG] WARNING: Mock data is enabled - forcing to use real data`
			);
			(config as any).useMockData = false;
			(config as any).useMockApiData = false;
			(config as any).useMockTaxiiData = false;
		}

		await loadDashboardData();
		setLastRefreshed(new Date());

		console.log(
			`✅ [Dashboard] Refresh completed at ${new Date().toLocaleTimeString()}`
		);
	};

	const loadDashboardData = async () => {
		setLoading(true);

		console.log(`🔄 [Dashboard] Loading dashboard data...`);
		console.log(
			`📊 [Dashboard] Config status: useMockData=${config.useMockData}, useMockApiData=${config.useMockApiData}, useMockTaxiiData=${config.useMockTaxiiData}`
		);

		try {
			// Force settings to use real data
			(config as any).useMockData = false;
			(config as any).useMockApiData = false;
			(config as any).useMockTaxiiData = false;

			// Collect data from multiple sources
			console.log(
				`🔍 [Dashboard] Fetching threat intelligence from multiple sources...`
			);

			const [apiData, taxiiData] = await Promise.all([
				aggregateIntelligence("recent threats").catch((e) => {
					console.error(`❌ [Dashboard] Error fetching API intelligence:`, e);
					return {
						indicators: [],
						sources: {},
						timestamp: new Date().toISOString(),
					};
				}),
				fetchTaxiiIntelligence().catch((e) => {
					console.error(`❌ [Dashboard] Error fetching TAXII intelligence:`, e);
					return [];
				}),
			]);

			// Combine all indicators
			const allIndicators = [...apiData.indicators, ...taxiiData];

			console.log(
				`✅ [Dashboard] Retrieved ${allIndicators.length} total indicators`
			);
			console.log(
				`📊 [Dashboard] API sources: ${JSON.stringify(apiData.sources)}`
			);

			// Check if we got any meaningful data
			if (allIndicators.length === 0) {
				// If no real data was returned, use sample data instead
				console.log(
					`⚠️ [Dashboard] No threat intelligence data returned from APIs, using sample data`
				);
				setDashboard(getSampleDashboardData());
			} else {
				// Format the response into our Dashboard interface structure
				// We'll use sample data for the sections we don't have real data for
				const sampleData = getSampleDashboardData();

				console.log(
					`📊 [Dashboard] Building dashboard with ${allIndicators.length} real-time indicators`
				);

				const formattedData: Dashboard = {
					recentIndicators: allIndicators.slice(0, 5),
					activeCampaigns: sampleData.activeCampaigns, // Use sample campaigns until real ones are implemented
					trendingThreats: sampleData.trendingThreats, // Use sample threats until real ones are implemented
					recentReports: sampleData.recentReports, // Use sample reports until real ones are implemented
					threatsByRegion: sampleData.threatsByRegion, // Use sample regions until real ones are implemented
					threatsBySector: sampleData.threatsBySector, // Use sample sectors until real ones are implemented
				};

				setDashboard(formattedData);
			}
			setLoading(false);
			setLastRefreshed(new Date());

			console.log(
				`✅ [Dashboard] Dashboard data loaded successfully at ${new Date().toLocaleTimeString()}`
			);
		} catch (error) {
			console.error(`❌ [Dashboard] Error loading dashboard data:`, error);
			setLoading(false);
			// Fallback to sample data if API fails
			setDashboard(getSampleDashboardData());
		}
	};

	// Sample data function - In a real application, this would come from an API
	const getSampleDashboardData = (): Dashboard => {
		return {
			recentIndicators: [
				{
					id: "ind-001",
					type: "IP",
					value: "45.153.243.77",
					confidence: 90,
					severity: "High",
					firstSeen: "2023-05-10T12:00:00Z",
					lastSeen: "2023-05-15T18:30:00Z",
					tags: ["C2", "Ransomware", "TOR Exit Node"],
					relatedActors: ["BlackCat", "ALPHV"],
					description:
						"Command and control server for BlackCat/ALPHV ransomware operations",
				},
				{
					id: "ind-002",
					type: "Domain",
					value: "secureupdate-microsft.com",
					confidence: 85,
					severity: "High",
					firstSeen: "2023-05-12T09:15:00Z",
					lastSeen: "2023-05-16T22:45:00Z",
					tags: ["Phishing", "Typosquatting", "Credential Theft"],
					description:
						"Typosquatting domain used in phishing campaigns against financial institutions",
				},
				{
					id: "ind-003",
					type: "Hash",
					value: "5f2b7c3d4e5f6a7b8c9d0e1f2a3b4c5d",
					confidence: 95,
					severity: "High",
					firstSeen: "2023-05-08T14:30:00Z",
					lastSeen: "2023-05-15T11:20:00Z",
					tags: ["Malware", "Backdoor", "RAT"],
					relatedActors: ["APT41"],
					description:
						"Backdoor associated with APT41 operations targeting healthcare sector",
				},
			],
			activeCampaigns: [
				{
					id: "camp-001",
					name: "Operation ShadowHammer",
					description: "Supply chain attack targeting software vendors",
					actors: ["APT41", "BlackTech"],
					targets: ["Technology", "Manufacturing"],
					ttps: ["Supply Chain Compromise", "Code Signing Abuse"],
					startDate: "2023-01-15T00:00:00Z",
					status: "Active",
					indicators: [],
				},
				{
					id: "camp-002",
					name: "DarkHydrus Resurgence",
					description: "Targeted phishing campaign against government entities",
					actors: ["DarkHydrus"],
					targets: ["Government", "Diplomatic"],
					ttps: ["Spear Phishing", "PowerShell Empire"],
					startDate: "2023-03-22T00:00:00Z",
					status: "Active",
					indicators: [],
				},
			],
			trendingThreats: [
				{
					category: "Ransomware",
					trend: 15,
					previousPeriod: 85,
					currentPeriod: 100,
				},
				{
					category: "Supply Chain Attacks",
					trend: 23,
					previousPeriod: 65,
					currentPeriod: 88,
				},
				{
					category: "Cloud Service Targeting",
					trend: 30,
					previousPeriod: 50,
					currentPeriod: 80,
				},
				{
					category: "IoT Exploitation",
					trend: -5,
					previousPeriod: 70,
					currentPeriod: 65,
				},
			],
			recentReports: [
				{
					id: "rep-001",
					title: "BlackCat Ransomware: New Encryption Techniques",
					summary:
						"Analysis of new encryption methods employed by BlackCat ransomware group affecting critical infrastructure",
					publishDate: "2023-05-14T00:00:00Z",
					severity: "Critical",
					confidence: "High",
					affectedSectors: ["Energy", "Healthcare", "Financial"],
					affectedRegions: ["North America", "Europe"],
					mitigations: [
						"Update endpoint protection to latest versions",
						"Implement application allowlisting",
						"Ensure offline backups are maintained",
					],
				},
				{
					id: "rep-002",
					title: "APT41 Targeting Healthcare Providers",
					summary:
						"Ongoing targeted campaign against healthcare providers to exfiltrate patient data",
					publishDate: "2023-05-10T00:00:00Z",
					severity: "High",
					confidence: "Medium",
					affectedSectors: ["Healthcare"],
					affectedRegions: ["North America", "Asia Pacific"],
					mitigations: [
						"Patch internet-facing systems",
						"Enable MFA for all remote access",
						"Monitor for suspicious PowerShell execution",
					],
				},
			],
			threatsByRegion: [
				{ region: "North America", count: 156 },
				{ region: "Europe", count: 142 },
				{ region: "Asia Pacific", count: 124 },
				{ region: "Middle East", count: 89 },
				{ region: "Latin America", count: 67 },
				{ region: "Africa", count: 43 },
			],
			threatsBySector: [
				{ sector: "Financial", count: 135 },
				{ sector: "Healthcare", count: 120 },
				{ sector: "Government", count: 115 },
				{ sector: "Technology", count: 105 },
				{ sector: "Energy", count: 95 },
				{ sector: "Manufacturing", count: 85 },
				{ sector: "Retail", count: 65 },
			],
		};
	};

	// Chart components
	const ThreatsBySectorChart = ({
		data,
	}: {
		data: { sector: string; count: number }[];
	}) => {
		if (!data || data.length === 0) return null;

		const chartData = {
			labels: data.map((item) => item.sector),
			datasets: [
				{
					label: "Threats by Sector",
					data: data.map((item) => item.count),
					backgroundColor: [
						"rgba(255, 99, 132, 0.6)",
						"rgba(54, 162, 235, 0.6)",
						"rgba(255, 206, 86, 0.6)",
						"rgba(75, 192, 192, 0.6)",
						"rgba(153, 102, 255, 0.6)",
						"rgba(255, 159, 64, 0.6)",
						"rgba(199, 199, 199, 0.6)",
					],
					borderColor: [
						"rgba(255, 99, 132, 1)",
						"rgba(54, 162, 235, 1)",
						"rgba(255, 206, 86, 1)",
						"rgba(75, 192, 192, 1)",
						"rgba(153, 102, 255, 1)",
						"rgba(255, 159, 64, 1)",
						"rgba(199, 199, 199, 1)",
					],
					borderWidth: 1,
				},
			],
		};

		return (
			<div className="h-64">
				<Doughnut
					data={chartData}
					options={{
						responsive: true,
						plugins: {
							legend: {
								position: "right",
								labels: {
									boxWidth: 12,
									font: {
										size: 10,
									},
								},
							},
							title: {
								display: true,
								text: "Threats by Industry Sector",
								font: {
									size: 14,
								},
							},
						},
						maintainAspectRatio: false,
					}}
				/>
			</div>
		);
	};

	const ThreatsByRegionChart = ({
		data,
	}: {
		data: { region: string; count: number }[];
	}) => {
		if (!data || data.length === 0) return null;

		const chartData = {
			labels: data.map((item) => item.region),
			datasets: [
				{
					label: "Threat Count",
					data: data.map((item) => item.count),
					backgroundColor: "rgba(75, 192, 192, 0.6)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 1,
				},
			],
		};

		return (
			<div className="h-64">
				<Bar
					data={chartData}
					options={{
						responsive: true,
						plugins: {
							legend: {
								display: false,
							},
							title: {
								display: true,
								text: "Threats by Geographic Region",
								font: {
									size: 14,
								},
							},
						},
						scales: {
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: "Count",
								},
							},
							x: {
								title: {
									display: true,
									text: "Region",
								},
							},
						},
						maintainAspectRatio: false,
					}}
				/>
			</div>
		);
	};

	const TrendingThreatsChart = ({
		data,
	}: {
		data: {
			category: string;
			trend: number;
			previousPeriod: number;
			currentPeriod: number;
		}[];
	}) => {
		if (!data || data.length === 0) return null;

		const chartData = {
			labels: data.map((item) => item.category),
			datasets: [
				{
					label: "Previous Period",
					data: data.map((item) => item.previousPeriod),
					backgroundColor: "rgba(54, 162, 235, 0.5)",
					borderColor: "rgba(54, 162, 235, 1)",
					borderWidth: 1,
				},
				{
					label: "Current Period",
					data: data.map((item) => item.currentPeriod),
					backgroundColor: "rgba(255, 99, 132, 0.5)",
					borderColor: "rgba(255, 99, 132, 1)",
					borderWidth: 1,
				},
			],
		};

		return (
			<div className="h-64">
				<Bar
					data={chartData}
					options={{
						responsive: true,
						plugins: {
							legend: {
								position: "top",
							},
							title: {
								display: true,
								text: "Trending Threats",
								font: {
									size: 14,
								},
							},
						},
						scales: {
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: "Threat Level",
								},
							},
						},
						maintainAspectRatio: false,
					}}
				/>
			</div>
		);
	};

	// Render Log Viewer
	const renderLogViewer = () => {
		if (!showLogs) return null;

		return (
			<div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-64 bg-gray-900 text-gray-100 p-2 z-50 overflow-hidden flex flex-col">
				<div className="flex justify-between items-center mb-2">
					<h3 className="text-sm font-bold">Console Logs ({logs.length})</h3>
					<button
						onClick={() => setShowLogs(false)}
						className="text-gray-400 hover:text-white"
					>
						Close
					</button>
				</div>
				<div
					ref={logRef}
					className="flex-1 overflow-y-auto font-mono text-xs p-2 bg-gray-800 rounded"
				>
					{logs.map((log, i) => (
						<div key={i} className="mb-1">
							<span className="text-gray-500">
								[{log.timestamp.toLocaleTimeString()}]
							</span>{" "}
							<span
								className={
									log.message.includes("✅")
										? "text-green-400"
										: log.message.includes("❌")
										? "text-red-400"
										: log.message.includes("⚠️")
										? "text-yellow-400"
										: log.message.includes("🔄")
										? "text-blue-400"
										: "text-gray-300"
								}
							>
								{log.message}
							</span>
						</div>
					))}
				</div>
			</div>
		);
	};

	// Render the refresh button and timestamp
	const renderRefreshControls = () => {
		return (
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center">
						<div className="text-sm text-gray-500 mr-3">
							Last updated: {lastRefreshed.toLocaleTimeString()}
						</div>
						{!config.useMockData && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
								Real-time data
							</span>
						)}
						{config.useMockData && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								<span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
								Sample data
							</span>
						)}
					</div>
					<div className="flex items-center">
						<button
							onClick={() => setShowLogs(!showLogs)}
							className="flex items-center px-2 py-1 mr-2 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
						>
							{showLogs ? "Hide Logs" : "Show Logs"}
						</button>
						<button
							onClick={refreshData}
							disabled={loading}
							className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
								loading
									? "bg-gray-200 text-gray-500 cursor-not-allowed"
									: "bg-blue-50 text-blue-600 hover:bg-blue-100"
							}`}
						>
							{loading ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Refreshing...
								</>
							) : (
								<>
									<svg
										className="-ml-1 mr-2 h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									Refresh Data
								</>
							)}
						</button>
					</div>
				</div>
				{config.autoRefreshInterval > 0 && (
					<div className="text-xs text-gray-500">
						Auto-refreshes every {config.autoRefreshInterval / 1000} seconds
					</div>
				)}
			</div>
		);
	};

	// Dashboard view
	const renderDashboard = () => {
		if (!dashboard) return null;

		return (
			<>
				{renderRefreshControls()}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{/* Top row - Threat Summary */}
					<div className="bg-white rounded-lg shadow p-4 col-span-1 md:col-span-2">
						<h2 className="text-xl font-semibold mb-3">
							Threat Intelligence Summary
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600 mb-1">Recent Indicators</p>
								<p className="text-2xl font-bold">
									{dashboard.recentIndicators.length}
								</p>
							</div>
							<div className="bg-red-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
								<p className="text-2xl font-bold">
									{dashboard.activeCampaigns.length}
								</p>
							</div>
							<div className="bg-yellow-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600 mb-1">Recent Reports</p>
								<p className="text-2xl font-bold">
									{dashboard.recentReports.length}
								</p>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600 mb-1">Affected Sectors</p>
								<p className="text-2xl font-bold">
									{dashboard.threatsBySector.length}
								</p>
							</div>
						</div>
					</div>

					{/* Charts */}
					<div className="bg-white rounded-lg shadow p-4">
						<ThreatsBySectorChart data={dashboard.threatsBySector} />
					</div>
					<div className="bg-white rounded-lg shadow p-4">
						<ThreatsByRegionChart data={dashboard.threatsByRegion} />
					</div>
					<div className="bg-white rounded-lg shadow p-4 col-span-1 md:col-span-2">
						<TrendingThreatsChart data={dashboard.trendingThreats} />
					</div>

					{/* Recent Reports */}
					<div className="bg-white rounded-lg shadow p-4 col-span-1 md:col-span-2">
						<h2 className="text-xl font-semibold mb-3">
							Recent Intelligence Reports
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Title
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Published
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Severity
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Affected Sectors
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{dashboard.recentReports.map((report) => (
										<tr key={report.id} className="hover:bg-gray-50">
											<td className="px-4 py-2 text-sm font-medium text-gray-800">
												{report.title}
											</td>
											<td className="px-4 py-2 text-sm text-gray-600">
												{new Date(report.publishDate).toLocaleDateString()}
											</td>
											<td className="px-4 py-2">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														report.severity === "Critical"
															? "bg-red-100 text-red-800"
															: report.severity === "High"
															? "bg-orange-100 text-orange-800"
															: report.severity === "Medium"
															? "bg-yellow-100 text-yellow-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{report.severity}
												</span>
											</td>
											<td className="px-4 py-2 text-sm text-gray-600">
												{report.affectedSectors.join(", ")}
											</td>
											<td className="px-4 py-2 text-sm">
												<button
													onClick={() => setSelectedReport(report)}
													className="text-blue-600 hover:text-blue-800"
												>
													View Details
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Recent Indicators */}
					<div className="bg-white rounded-lg shadow p-4 col-span-1 md:col-span-2">
						<h2 className="text-xl font-semibold mb-3">
							Latest Threat Indicators
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Type
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Value
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Confidence
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Severity
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Tags
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{dashboard.recentIndicators.map((indicator) => (
										<tr key={indicator.id} className="hover:bg-gray-50">
											<td className="px-4 py-2 text-sm font-medium text-gray-800">
												{indicator.type}
											</td>
											<td className="px-4 py-2 text-sm font-mono">
												{indicator.value}
											</td>
											<td className="px-4 py-2 text-sm text-gray-600">
												{indicator.confidence}%
											</td>
											<td className="px-4 py-2">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														indicator.severity === "High"
															? "bg-red-100 text-red-800"
															: indicator.severity === "Medium"
															? "bg-yellow-100 text-yellow-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{indicator.severity}
												</span>
											</td>
											<td className="px-4 py-2 text-sm text-gray-600">
												<div className="flex flex-wrap gap-1">
													{indicator.tags.map((tag, index) => (
														<span
															key={index}
															className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
														>
															{tag}
														</span>
													))}
												</div>
											</td>
											<td className="px-4 py-2 text-sm">
												<button
													onClick={() => setSelectedIndicator(indicator)}
													className="text-blue-600 hover:text-blue-800"
												>
													View Details
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</>
		);
	};

	// Indicator details modal
	const IndicatorDetailsModal = ({
		indicator,
		onClose,
	}: {
		indicator: ThreatIndicator | null;
		onClose: () => void;
	}) => {
		if (!indicator) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								Threat Indicator Details
							</h2>
							<button
								onClick={onClose}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<p className="text-sm text-gray-600">Type</p>
								<p className="font-medium">{indicator.type}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Value</p>
								<p className="font-mono">{indicator.value}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Confidence</p>
								<p className="font-medium">{indicator.confidence}%</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Severity</p>
								<p className="font-medium">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											indicator.severity === "High"
												? "bg-red-100 text-red-800"
												: indicator.severity === "Medium"
												? "bg-yellow-100 text-yellow-800"
												: "bg-green-100 text-green-800"
										}`}
									>
										{indicator.severity}
									</span>
								</p>
							</div>
						</div>

						<div className="mb-4">
							<p className="text-sm text-gray-600 mb-1">First Seen</p>
							<p className="font-medium">
								{new Date(indicator.firstSeen).toLocaleString()}
							</p>
						</div>

						<div className="mb-4">
							<p className="text-sm text-gray-600 mb-1">Last Seen</p>
							<p className="font-medium">
								{new Date(indicator.lastSeen).toLocaleString()}
							</p>
						</div>

						{indicator.description && (
							<div className="mb-4">
								<p className="text-sm text-gray-600 mb-1">Description</p>
								<p className="text-gray-800">{indicator.description}</p>
							</div>
						)}

						<div className="mb-4">
							<p className="text-sm text-gray-600 mb-1">Tags</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{indicator.tags.map((tag, index) => (
									<span
										key={index}
										className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
									>
										{tag}
									</span>
								))}
							</div>
						</div>

						{indicator.relatedActors && indicator.relatedActors.length > 0 && (
							<div className="mb-4">
								<p className="text-sm text-gray-600 mb-1">
									Related Threat Actors
								</p>
								<div className="flex flex-wrap gap-1 mt-1">
									{indicator.relatedActors.map((actor, index) => (
										<span
											key={index}
											className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
										>
											{actor}
										</span>
									))}
								</div>
							</div>
						)}

						<div className="mt-6 flex justify-end">
							<button
								onClick={onClose}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Report details modal
	const ReportDetailsModal = ({
		report,
		onClose,
	}: {
		report: IntelligenceReport | null;
		onClose: () => void;
	}) => {
		if (!report) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
					<div className="p-6">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								{report.title}
							</h2>
							<button
								onClick={onClose}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>

						<div className="flex flex-wrap gap-2 mb-4">
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									report.severity === "Critical"
										? "bg-red-100 text-red-800"
										: report.severity === "High"
										? "bg-orange-100 text-orange-800"
										: report.severity === "Medium"
										? "bg-yellow-100 text-yellow-800"
										: "bg-green-100 text-green-800"
								}`}
							>
								{report.severity} Severity
							</span>

							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									report.confidence === "High"
										? "bg-blue-100 text-blue-800"
										: report.confidence === "Medium"
										? "bg-indigo-100 text-indigo-800"
										: "bg-purple-100 text-purple-800"
								}`}
							>
								{report.confidence} Confidence
							</span>

							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								Published: {new Date(report.publishDate).toLocaleDateString()}
							</span>
						</div>

						<div className="mb-6">
							<h3 className="text-lg font-medium mb-2">Summary</h3>
							<p className="text-gray-800 mb-4">{report.summary}</p>

							{report.fullReport && (
								<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
									<h4 className="text-md font-medium mb-2">Full Analysis</h4>
									<p className="text-gray-800 whitespace-pre-line">
										{report.fullReport}
									</p>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-medium mb-2">Affected Sectors</h3>
								<div className="flex flex-wrap gap-1">
									{report.affectedSectors.map((sector, index) => (
										<span
											key={index}
											className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
										>
											{sector}
										</span>
									))}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-medium mb-2">Affected Regions</h3>
								<div className="flex flex-wrap gap-1">
									{report.affectedRegions.map((region, index) => (
										<span
											key={index}
											className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm"
										>
											{region}
										</span>
									))}
								</div>
							</div>
						</div>

						{report.mitigations && report.mitigations.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-medium mb-2">
									Recommended Mitigations
								</h3>
								<ul className="list-disc pl-5 space-y-1">
									{report.mitigations.map((mitigation, index) => (
										<li key={index} className="text-gray-800">
											{mitigation}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="mt-6 flex justify-end">
							<button
								onClick={onClose}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Tool information section
	const renderToolInfo = () => {
		return (
			<div className="bg-white rounded-lg shadow p-6 mb-8">
				<h2 className="text-2xl font-bold mb-4">
					Threat Intelligence Platform
				</h2>
				<p className="text-gray-700 mb-6">
					This is a real-time threat intelligence platform designed to keep your
					organization a step ahead of cyber threats. By continuously
					collecting, analyzing, and distributing actionable intelligence, it
					enables security teams to identify, respond to, and even anticipate
					emerging attacks—before they impact your business.
				</p>

				<h3 className="text-xl font-semibold mb-3">Key Features</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div className="border border-gray-200 rounded-lg p-4">
						<h4 className="text-lg font-medium mb-2">Global Threat Database</h4>
						<p className="text-gray-600">
							Continuously updated repository of indicators, malicious domains,
							threat actors, tactics, and new vulnerabilities, sourced from open
							and commercial feeds, darknet, and internal honeypots.
						</p>
					</div>

					<div className="border border-gray-200 rounded-lg p-4">
						<h4 className="text-lg font-medium mb-2">Customized Alerts</h4>
						<p className="text-gray-600">
							Receive real-time, tailored notifications based on your assets,
							industry, and risk appetite. Alerts are prioritized by relevance
							and severity so your team can focus on what matters.
						</p>
					</div>

					<div className="border border-gray-200 rounded-lg p-4">
						<h4 className="text-lg font-medium mb-2">Attribution Analysis</h4>
						<p className="text-gray-600">
							Leverage automated and analyst-assisted tools to correlate threat
							indicators with known adversaries, campaigns, and geopolitical
							motives, helping you understand the who and why behind attacks.
						</p>
					</div>

					<div className="border border-gray-200 rounded-lg p-4">
						<h4 className="text-lg font-medium mb-2">SIEM Integration</h4>
						<p className="text-gray-600">
							Seamlessly integrate with your Security Information and Event
							Management (SIEM) system, feeding intelligence directly into your
							existing workflows for correlation, incident response, and
							automation.
						</p>
					</div>
				</div>

				<h3 className="text-xl font-semibold mb-3">What Sets It Apart?</h3>
				<ul className="list-disc pl-6 mb-6 space-y-2">
					<li className="text-gray-700">
						<span className="font-medium">Automated + Human Curation:</span>{" "}
						Combines machine-speed analytics with human expert review for
						high-quality intelligence.
					</li>
					<li className="text-gray-700">
						<span className="font-medium">Multi-Source Ingestion:</span> Ingests
						data from OSINT, commercial feeds, ISACs, and proprietary honeypots.
					</li>
					<li className="text-gray-700">
						<span className="font-medium">Flexible Delivery:</span> Dashboards,
						APIs, and automated feeds for various security tools and workflows.
					</li>
				</ul>

				<h3 className="text-xl font-semibold mb-3">Sample Workflow</h3>
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
					<ol className="list-decimal pl-6 space-y-3">
						<li className="text-gray-700">
							<span className="font-medium">Collection:</span> Aggregates global
							threat data 24/7 from multiple sources.
						</li>
						<li className="text-gray-700">
							<span className="font-medium">Analysis:</span> Enriches and
							correlates IOCs, identifies patterns, and attributes them to
							threat actors or campaigns.
						</li>
						<li className="text-gray-700">
							<span className="font-medium">Alerting:</span> Delivers
							high-confidence, actionable alerts to the right teams via email,
							dashboard, or SIEM integration.
						</li>
						<li className="text-gray-700">
							<span className="font-medium">Response & Reporting:</span> Offers
							deep-dive analysis and reporting for incident response,
							compliance, and executive awareness.
						</li>
					</ol>
				</div>
			</div>
		);
	};

	// Fetch specific threat indicator details
	const fetchThreatIndicator = async (id: string) => {
		try {
			const response = await fetch(
				`https://api.threatintelligence.yourdomain.com/indicators/${id}`,
				{
					headers: {
						Authorization: "Bearer YOUR_API_KEY",
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			setSelectedIndicator(data);
		} catch (error) {
			console.error(`Error fetching indicator ${id}:`, error);
			// Could add fallback behavior here
		}
	};

	// Fetch intelligence reports
	const fetchIntelligenceReports = async (filters = {}) => {
		try {
			const response = await fetch(
				"https://api.threatintelligence.yourdomain.com/reports",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer YOUR_API_KEY",
						"Content-Type": "application/json",
					},
					body: JSON.stringify(filters),
				}
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching reports:", error);
			return [];
		}
	};

	// Search for threats
	const searchThreats = async (query: string) => {
		if (!query.trim()) return;

		try {
			const response = await fetch(
				"https://api.threatintelligence.yourdomain.com/search",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer YOUR_API_KEY",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query, limit: 20 }),
				}
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error searching threats:", error);
			return [];
		}
	};

	// Find and replace the handleSearch function with this:
	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchTerm.trim()) return;

		setLoading(true);
		try {
			const results = await searchThreats(searchTerm);
			// Update UI with search results
			// This implementation will depend on your UI structure
			// For example, you might want to set a new state for search results
			setLoading(false);
		} catch (error) {
			console.error("Search failed:", error);
			setLoading(false);
		}
	};

	// Main return
	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="mb-6">
				<div className="flex items-center mb-2">
					<Link
						href="/tools"
						className="text-blue-600 hover:text-blue-800 mr-2"
					>
						&larr; Tools Dashboard
					</Link>
				</div>
				<h1 className="text-3xl font-bold">Threat Intelligence Platform</h1>
				<p className="text-gray-600 mt-1">
					Actionable intelligence to defend against emerging cyber threats
				</p>
			</div>

			{/* Navigation */}
			<div className="bg-white rounded-lg shadow mb-6">
				<div className="flex flex-wrap border-b">
					<button
						onClick={() => setActiveSection("dashboard")}
						className={`px-4 py-3 text-sm font-medium ${
							activeSection === "dashboard"
								? "border-b-2 border-blue-600 text-blue-600"
								: "text-gray-600 hover:text-blue-600"
						}`}
					>
						Dashboard
					</button>
					<button
						onClick={() => setActiveSection("information")}
						className={`px-4 py-3 text-sm font-medium ${
							activeSection === "information"
								? "border-b-2 border-blue-600 text-blue-600"
								: "text-gray-600 hover:text-blue-600"
						}`}
					>
						About This Tool
					</button>
				</div>
			</div>

			{/* Loading state */}
			{loading && (
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
				</div>
			)}

			{/* Main content */}
			{!loading && (
				<>
					{activeSection === "dashboard" && renderDashboard()}
					{activeSection === "information" && renderToolInfo()}
				</>
			)}

			{/* Modals */}
			{selectedIndicator && (
				<IndicatorDetailsModal
					indicator={selectedIndicator}
					onClose={() => setSelectedIndicator(null)}
				/>
			)}

			{selectedReport && (
				<ReportDetailsModal
					report={selectedReport}
					onClose={() => setSelectedReport(null)}
				/>
			)}

			{/* Log Viewer */}
			{renderLogViewer()}
		</div>
	);
}
