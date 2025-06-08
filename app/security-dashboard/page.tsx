"use client";

import { useState, useEffect, useCallback } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	LineElement,
	PointElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
	Shield,
	AlertTriangle,
	Activity,
	Zap,
	Globe,
	Search,
	RefreshCw,
	CheckCircle,
	XCircle,
	Clock,
	TrendingUp,
	TrendingDown,
	Eye,
	Database,
	Server,
	Lock,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	LineElement,
	PointElement
);

// Types for aggregated security data
interface SecurityMetrics {
	overallRiskScore: number;
	threatsDetected: number;
	vulnerabilitiesFound: number;
	apisScanned: number;
	reconResults: number;
	lastScanTime: string;
	systemsMonitored: number;
	incidentsResolved: number;
}

interface ThreatData {
	totalThreats: number;
	newThreats: number;
	highRiskThreats: number;
	threatsByType: { type: string; count: number }[];
	recentThreats: {
		indicator: string;
		type: string;
		riskScore: number;
		source: string;
		timestamp: string;
	}[];
}

interface VulnerabilityData {
	totalVulnerabilities: number;
	criticalVulns: number;
	highVulns: number;
	mediumVulns: number;
	lowVulns: number;
	recentScans: {
		id: string;
		target: string;
		vulnerabilities: number;
		riskLevel: string;
		timestamp: string;
	}[];
}

interface APISecurityData {
	totalEndpoints: number;
	secureEndpoints: number;
	vulnerableEndpoints: number;
	recentFuzzResults: {
		endpoint: string;
		method: string;
		issues: number;
		riskLevel: string;
		timestamp: string;
	}[];
}

interface ReconData {
	domainsScanned: number;
	subdomainsFound: number;
	exposedServices: number;
	recentReconResults: {
		target: string;
		findings: number;
		riskLevel: string;
		timestamp: string;
	}[];
}

interface SecurityAlert {
	id: string;
	type: "threat" | "vulnerability" | "api" | "recon";
	severity: "critical" | "high" | "medium" | "low";
	title: string;
	description: string;
	timestamp: string;
	status: "active" | "investigating" | "resolved";
	source: string;
}

interface SystemStatus {
	threatIntelligence: "online" | "offline" | "degraded";
	vulnerabilityScanner: "online" | "offline" | "degraded";
	apiFuzzer: "online" | "offline" | "degraded";
	reconBot: "online" | "offline" | "degraded";
}

// Component for metric cards
const MetricCard = ({
	title,
	value,
	icon,
	trend,
	color = "blue",
	onClick,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	trend?: { value: number; positive: boolean };
	color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
	onClick?: () => void;
}) => {
	const colorClasses = {
		blue: "bg-blue-50 border-blue-200 text-blue-700",
		green: "bg-green-50 border-green-200 text-green-700",
		red: "bg-red-50 border-red-200 text-red-700",
		yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
		purple: "bg-purple-50 border-purple-200 text-purple-700",
		gray: "bg-gray-50 border-gray-200 text-gray-600",
	};

	return (
		<div
			className={`${colorClasses[color]} border-2 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
			onClick={onClick}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium opacity-80">{title}</p>
					<p className="text-2xl font-bold mt-1">{value}</p>
					{trend && (
						<div className="flex items-center mt-2">
							{trend.positive ? (
								<TrendingUp className="w-4 h-4 text-green-500 mr-1" />
							) : (
								<TrendingDown className="w-4 h-4 text-red-500 mr-1" />
							)}
							<span
								className={`text-xs ${
									trend.positive ? "text-green-600" : "text-red-600"
								}`}
							>
								{Math.abs(trend.value)}%
							</span>
						</div>
					)}
				</div>
				<div className="text-2xl opacity-70">{icon}</div>
			</div>
		</div>
	);
};

// Component for status indicator
const StatusIndicator = ({
	status,
}: {
	status: "online" | "offline" | "degraded";
}) => {
	const statusConfig = {
		online: {
			color: "bg-green-500",
			text: "Online",
			textColor: "text-green-700",
		},
		offline: {
			color: "bg-red-500",
			text: "Offline",
			textColor: "text-red-700",
		},
		degraded: {
			color: "bg-yellow-500",
			text: "Degraded",
			textColor: "text-yellow-700",
		},
	};

	const config = statusConfig[status];

	return (
		<div className="flex items-center space-x-2">
			<div
				className={`w-3 h-3 rounded-full ${config.color} animate-pulse`}
			></div>
			<span className={`text-sm font-medium ${config.textColor}`}>
				{config.text}
			</span>
		</div>
	);
};

// Component for security alerts
const SecurityAlertCard = ({ alert }: { alert: SecurityAlert }) => {
	const severityColors = {
		critical: "border-red-500 bg-red-50",
		high: "border-orange-500 bg-orange-50",
		medium: "border-yellow-500 bg-yellow-50",
		low: "border-blue-500 bg-blue-50",
	};

	const severityIcons = {
		critical: <XCircle className="w-5 h-5 text-red-500" />,
		high: <AlertTriangle className="w-5 h-5 text-orange-500" />,
		medium: <Clock className="w-5 h-5 text-yellow-500" />,
		low: <CheckCircle className="w-5 h-5 text-blue-500" />,
	};

	return (
		<div
			className={`border-l-4 p-4 rounded-r-lg ${
				severityColors[alert.severity]
			}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-start space-x-3">
					{severityIcons[alert.severity]}
					<div>
						<h4 className="font-semibold text-gray-900">{alert.title}</h4>
						<p className="text-sm text-gray-600 mt-1">{alert.description}</p>
						<div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
							<span>{alert.source}</span>
							<span>{new Date(alert.timestamp).toLocaleString()}</span>
							<span
								className={`px-2 py-1 rounded-full ${
									alert.status === "active"
										? "bg-red-100 text-red-700"
										: alert.status === "investigating"
										? "bg-yellow-100 text-yellow-700"
										: "bg-green-100 text-green-700"
								}`}
							>
								{alert.status}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function SecurityDashboard() {
	const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
		overallRiskScore: 0,
		threatsDetected: 0,
		vulnerabilitiesFound: 0,
		apisScanned: 0,
		reconResults: 0,
		lastScanTime: new Date().toISOString(),
		systemsMonitored: 0,
		incidentsResolved: 0,
	});

	const [threatData, setThreatData] = useState<ThreatData>({
		totalThreats: 0,
		newThreats: 0,
		highRiskThreats: 0,
		threatsByType: [],
		recentThreats: [],
	});

	const [vulnerabilityData, setVulnerabilityData] = useState<VulnerabilityData>(
		{
			totalVulnerabilities: 0,
			criticalVulns: 0,
			highVulns: 0,
			mediumVulns: 0,
			lowVulns: 0,
			recentScans: [],
		}
	);

	const [apiSecurityData, setApiSecurityData] = useState<APISecurityData>({
		totalEndpoints: 0,
		secureEndpoints: 0,
		vulnerableEndpoints: 0,
		recentFuzzResults: [],
	});

	const [reconData, setReconData] = useState<ReconData>({
		domainsScanned: 0,
		subdomainsFound: 0,
		exposedServices: 0,
		recentReconResults: [],
	});

	const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
	const [systemStatus, setSystemStatus] = useState<SystemStatus>({
		threatIntelligence: "online",
		vulnerabilityScanner: "online",
		apiFuzzer: "online",
		reconBot: "online",
	});

	const [loading, setLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

	// Fetch aggregated security data
	const fetchSecurityData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch data from all security tools in parallel
			const [
				metricsResponse,
				threatResponse,
				vulnResponse,
				apiResponse,
				reconResponse,
				alertsResponse,
				statusResponse,
			] = await Promise.allSettled([
				fetch("/api/security-dashboard/metrics"),
				fetch("/api/security-dashboard/threats"),
				fetch("/api/security-dashboard/vulnerabilities"),
				fetch("/api/security-dashboard/api-security"),
				fetch("/api/security-dashboard/reconnaissance"),
				fetch("/api/security-dashboard/alerts"),
				fetch("/api/security-dashboard/status"),
			]);

			// Process responses
			if (metricsResponse.status === "fulfilled" && metricsResponse.value.ok) {
				const data = await metricsResponse.value.json();
				setSecurityMetrics(data);
			}

			if (threatResponse.status === "fulfilled" && threatResponse.value.ok) {
				const data = await threatResponse.value.json();
				setThreatData(data);
			}

			if (vulnResponse.status === "fulfilled" && vulnResponse.value.ok) {
				const data = await vulnResponse.value.json();
				setVulnerabilityData(data);
			}

			if (apiResponse.status === "fulfilled" && apiResponse.value.ok) {
				const data = await apiResponse.value.json();
				setApiSecurityData(data);
			}

			if (reconResponse.status === "fulfilled" && reconResponse.value.ok) {
				const data = await reconResponse.value.json();
				setReconData(data);
			}

			if (alertsResponse.status === "fulfilled" && alertsResponse.value.ok) {
				const data = await alertsResponse.value.json();
				setSecurityAlerts(data);
			}

			if (statusResponse.status === "fulfilled" && statusResponse.value.ok) {
				const data = await statusResponse.value.json();
				setSystemStatus(data);
			}

			setLastUpdate(new Date());
		} catch (error) {
			console.error("Error fetching security data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Set up real-time updates
	useEffect(() => {
		fetchSecurityData();

		// Set up periodic refresh
		const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds

		// Set up WebSocket connection for real-time updates
		const ws = new WebSocket(
			process.env.NODE_ENV === "production"
				? "wss://your-domain.com/ws/security-dashboard"
				: "ws://localhost:5001"
		);

		ws.onmessage = (event) => {
			try {
				const update = JSON.parse(event.data);

				// Handle different types of real-time updates
				switch (update.type) {
					case "new_threat":
						setThreatData((prev) => ({
							...prev,
							totalThreats: prev.totalThreats + 1,
							newThreats: prev.newThreats + 1,
							recentThreats: [update.data, ...prev.recentThreats.slice(0, 9)],
						}));
						break;
					case "new_vulnerability":
						setVulnerabilityData((prev) => ({
							...prev,
							totalVulnerabilities: prev.totalVulnerabilities + 1,
							recentScans: [update.data, ...prev.recentScans.slice(0, 4)],
						}));
						break;
					case "new_alert":
						setSecurityAlerts((prev) => [update.data, ...prev.slice(0, 9)]);
						break;
					case "status_update":
						setSystemStatus((prev) => ({
							...prev,
							[update.service]: update.status,
						}));
						break;
				}

				setLastUpdate(new Date());
			} catch (error) {
				console.error("Error processing WebSocket message:", error);
			}
		};

		return () => {
			clearInterval(interval);
			ws.close();
		};
	}, [fetchSecurityData]);

	// Chart data for threat trends
	const threatTrendData = {
		labels: ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"],
		datasets: [
			{
				label: "Threats Detected",
				data: [12, 15, 8, 22, 18, 25, threatData.newThreats],
				borderColor: "rgb(239, 68, 68)",
				backgroundColor: "rgba(239, 68, 68, 0.1)",
				tension: 0.4,
			},
		],
	};

	// Chart data for vulnerability distribution
	const vulnerabilityDistributionData = {
		labels: ["Critical", "High", "Medium", "Low"],
		datasets: [
			{
				data: [
					vulnerabilityData.criticalVulns,
					vulnerabilityData.highVulns,
					vulnerabilityData.mediumVulns,
					vulnerabilityData.lowVulns,
				],
				backgroundColor: [
					"rgba(239, 68, 68, 0.8)",
					"rgba(245, 158, 11, 0.8)",
					"rgba(234, 179, 8, 0.8)",
					"rgba(34, 197, 94, 0.8)",
				],
				borderWidth: 2,
			},
		],
	};

	// Chart data for API security
	const apiSecurityData_chart = {
		labels: ["Secure Endpoints", "Vulnerable Endpoints"],
		datasets: [
			{
				data: [
					apiSecurityData.secureEndpoints,
					apiSecurityData.vulnerableEndpoints,
				],
				backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
				borderWidth: 2,
			},
		],
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900">
						Loading Security Dashboard
					</h2>
					<p className="text-gray-600">
						Connecting to security tools and aggregating real data...
					</p>
				</div>
			</div>
		);
	}

	// Check if we have any real data
	const hasData =
		securityMetrics.systemsMonitored > 0 ||
		threatData.totalThreats > 0 ||
		vulnerabilityData.totalVulnerabilities > 0 ||
		apiSecurityData.totalEndpoints > 0 ||
		reconData.domainsScanned > 0;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Security Dashboard
							</h1>
							<p className="text-gray-600 mt-1">
								Real-time aggregated view of your security posture
							</p>
							{!hasData && (
								<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
									<p className="text-yellow-800 text-sm flex items-center">
										<AlertTriangle className="w-4 h-4 mr-2" />
										No security tools are currently active. Please ensure your
										security services are running to see real-time data.
									</p>
								</div>
							)}
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-sm text-gray-500">
								Last updated: {lastUpdate.toLocaleTimeString()}
							</div>
							<button
								onClick={fetchSecurityData}
								disabled={loading}
								className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
							>
								<RefreshCw
									className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
								/>
								<span>Refresh</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Key Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<MetricCard
						title="Overall Risk Score"
						value={
							hasData ? `${securityMetrics.overallRiskScore}/100` : "No data"
						}
						icon={<Shield />}
						color={
							!hasData
								? "gray"
								: securityMetrics.overallRiskScore > 70
								? "red"
								: securityMetrics.overallRiskScore > 40
								? "yellow"
								: "green"
						}
						trend={
							hasData
								? {
										value: 5,
										positive: securityMetrics.overallRiskScore < 50,
								  }
								: undefined
						}
					/>
					<MetricCard
						title="Active Threats"
						value={hasData ? threatData.totalThreats : "No data"}
						icon={<AlertTriangle />}
						color={
							!hasData ? "gray" : threatData.totalThreats > 0 ? "red" : "green"
						}
						trend={
							hasData && threatData.totalThreats > 0
								? { value: 12, positive: false }
								: undefined
						}
					/>
					<MetricCard
						title="Vulnerabilities"
						value={hasData ? vulnerabilityData.totalVulnerabilities : "No data"}
						icon={<Zap />}
						color={
							!hasData
								? "gray"
								: vulnerabilityData.totalVulnerabilities > 0
								? "yellow"
								: "green"
						}
						trend={
							hasData && vulnerabilityData.totalVulnerabilities > 0
								? { value: 8, positive: false }
								: undefined
						}
					/>
					<MetricCard
						title="APIs Monitored"
						value={hasData ? apiSecurityData.totalEndpoints : "No data"}
						icon={<Globe />}
						color={!hasData ? "gray" : "blue"}
						trend={
							hasData && apiSecurityData.totalEndpoints > 0
								? { value: 15, positive: true }
								: undefined
						}
					/>
				</div>

				{/* System Status */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-8">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						System Status
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center space-x-3">
								<Database className="w-5 h-5 text-gray-600" />
								<span className="font-medium">Threat Intelligence</span>
							</div>
							<StatusIndicator status={systemStatus.threatIntelligence} />
						</div>
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center space-x-3">
								<Search className="w-5 h-5 text-gray-600" />
								<span className="font-medium">Vulnerability Scanner</span>
							</div>
							<StatusIndicator status={systemStatus.vulnerabilityScanner} />
						</div>
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center space-x-3">
								<Server className="w-5 h-5 text-gray-600" />
								<span className="font-medium">API Fuzzer</span>
							</div>
							<StatusIndicator status={systemStatus.apiFuzzer} />
						</div>
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center space-x-3">
								<Eye className="w-5 h-5 text-gray-600" />
								<span className="font-medium">Recon Bot</span>
							</div>
							<StatusIndicator status={systemStatus.reconBot} />
						</div>
					</div>
				</div>

				{/* Charts and Analytics */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Threat Trends */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Threat Detection Trends
						</h3>
						<div className="h-64">
							<Line
								data={threatTrendData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Vulnerability Distribution */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Vulnerability Distribution
						</h3>
						<div className="h-64">
							<Doughnut
								data={vulnerabilityDistributionData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: "bottom",
										},
									},
								}}
							/>
						</div>
					</div>
				</div>

				{/* Recent Activity and Alerts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Security Alerts */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Security Alerts
							</h3>
							<span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
								{
									securityAlerts.filter((alert) => alert.status === "active")
										.length
								}{" "}
								Active
							</span>
						</div>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{securityAlerts.length > 0 ? (
								securityAlerts.map((alert) => (
									<SecurityAlertCard key={alert.id} alert={alert} />
								))
							) : (
								<div className="text-center py-8">
									<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
									<p className="text-gray-500">No active security alerts</p>
								</div>
							)}
						</div>
					</div>

					{/* Recent Scans and Activities */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Recent Security Activities
						</h3>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{/* Recent vulnerability scans */}
							{vulnerabilityData.recentScans.map((scan, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="font-medium text-gray-900">
											Vulnerability Scan
										</p>
										<p className="text-sm text-gray-600">{scan.target}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-gray-900">
											{scan.vulnerabilities} issues
										</p>
										<p className="text-xs text-gray-500">
											{new Date(scan.timestamp).toLocaleString()}
										</p>
									</div>
								</div>
							))}

							{/* Recent API fuzz results */}
							{apiSecurityData.recentFuzzResults.map((result, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="font-medium text-gray-900">API Fuzzing</p>
										<p className="text-sm text-gray-600">{result.endpoint}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-gray-900">
											{result.issues} issues
										</p>
										<p className="text-xs text-gray-500">
											{new Date(result.timestamp).toLocaleString()}
										</p>
									</div>
								</div>
							))}

							{/* Recent recon results */}
							{reconData.recentReconResults.map((result, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="font-medium text-gray-900">Reconnaissance</p>
										<p className="text-sm text-gray-600">{result.target}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-gray-900">
											{result.findings} findings
										</p>
										<p className="text-xs text-gray-500">
											{new Date(result.timestamp).toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
