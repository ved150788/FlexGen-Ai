"use client";

import {
	useState,
	useEffect,
	ReactNode,
	MouseEvent,
	ChangeEvent,
	KeyboardEvent,
} from "react";
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
import { Pie, Bar } from "react-chartjs-2";

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

// Define custom component props
interface CardProps {
	children: ReactNode;
	className?: string;
}

interface ButtonProps {
	children: ReactNode;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
	disabled?: boolean;
	className?: string;
}

interface InputProps {
	placeholder: string;
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
	className?: string;
}

interface SelectProps {
	value: string;
	onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	options: { value: string; label: string }[];
	className?: string;
}

interface ChildrenProp {
	children: ReactNode;
	className?: string;
}

interface ClassNameProp extends ChildrenProp {
	className?: string;
}

// Define the result type
interface ThreatResult {
	indicator: string;
	type: string;
	threatScore: number;
	source: string;
	firstSeen?: string;
	lastSeen?: string;
	tags?: string[];
	sourceUrl?: string;
	sampleText?: string;
}

interface DashboardStats {
	totalThreats: number;
	newThreats: number;
	topDomains: { domain: string; count: number }[];
	topIPs: { ip: string; count: number }[];
	threatsByType: { type: string; count: number }[];
	sourceDistribution?: { source: string; count: number }[];
	mostActiveSource?: string;
	highestRiskScore?: number;
	isMockData?: boolean;
}

interface TaxiiSource {
	name: string;
	url: string;
	collection: string;
	iocCount: number;
}

interface TaxiiStatusData {
	status: string;
	taxiSources: TaxiiSource[];
	recentRuns: {
		timestamp: string;
		status: string;
		itemsAdded: number;
		itemsUpdated: number;
		error?: string;
	}[];
}

// Update component definitions to accept className prop
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	children: React.ReactNode;
}

// Update Badge to support variant prop
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	variant?: "default" | "outline";
}

// Update all component interfaces to support className prop
interface CommonProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	children: React.ReactNode;
}

interface TabProps extends CommonProps {
	active?: boolean;
	onClick?: () => void;
}

interface StatCardProps extends CommonProps {
	title: string;
	value: number | string;
	trend?: {
		value: number;
		label: string;
		positive: boolean;
	};
}

// Custom component implementations
const Card = ({ children, className = "" }: CardProps) => (
	<div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
		{children}
	</div>
);

const CardHeader = ({ children }: ChildrenProp) => (
	<div className="p-6 border-b">{children}</div>
);
const CardTitle = ({ children }: ChildrenProp) => (
	<h2 className="text-xl font-semibold">{children}</h2>
);
const CardDescription = ({ children }: ChildrenProp) => (
	<p className="text-gray-600 mt-1">{children}</p>
);
const CardContent = ({ children }: ChildrenProp) => (
	<div className="p-6">{children}</div>
);
const CardFooter = ({ children, className = "" }: ClassNameProp) => (
	<div className={`p-4 border-t ${className}`}>{children}</div>
);

const Button = ({
	children,
	onClick,
	disabled = false,
	className = "",
}: ButtonProps) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${className}`}
	>
		{children}
	</button>
);

const Input = ({
	placeholder,
	value,
	onChange,
	onKeyDown,
	className = "",
}: InputProps) => (
	<input
		type="text"
		placeholder={placeholder}
		value={value}
		onChange={onChange}
		onKeyDown={onKeyDown}
		className={`px-4 py-2 border rounded-md w-full ${className}`}
	/>
);

const Select = ({ value, onChange, options, className = "" }: SelectProps) => (
	<select
		value={value}
		onChange={onChange}
		className={`px-4 py-2 border rounded-md w-full ${className}`}
	>
		{options.map((option) => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		))}
	</select>
);

const Alert = ({ className, children, ...props }: AlertProps) => (
	<div
		className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`}
		{...props}
	>
		{children}
	</div>
);

const AlertTitle = ({ className, children, ...props }: AlertProps) => (
	<h5
		className={`mb-1 font-medium leading-none tracking-tight ${className}`}
		{...props}
	>
		{children}
	</h5>
);

const AlertDescription = ({ className, children, ...props }: AlertProps) => (
	<div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
		{children}
	</div>
);

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
	const baseClass =
		variant === "outline"
			? "bg-transparent border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-300"
			: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

	return (
		<div
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${baseClass} ${className}`}
			{...props}
		/>
	);
};

const SuccessAlert = ({ className = "", children, ...props }: CommonProps) => (
	<div
		className={`p-4 border-l-4 border-green-500 bg-green-50 text-green-700 my-4 ${className}`}
		{...props}
	>
		{children}
	</div>
);

const Tab = ({ active, onClick, className = "", children }: TabProps) => (
	<button
		onClick={onClick}
		className={`px-4 py-2 font-medium text-sm border-b-2 ${
			active
				? "border-blue-500 text-blue-600"
				: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
		} ${className}`}
	>
		{children}
	</button>
);

const Table = ({ children }: ChildrenProp) => (
	<div className="overflow-x-auto">
		<table className="min-w-full">{children}</table>
	</div>
);

const TableHeader = ({ children }: ChildrenProp) => (
	<thead className="bg-gray-50">{children}</thead>
);
const TableBody = ({ children }: ChildrenProp) => (
	<tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);
const TableRow = ({
	children,
	onClick,
}: ChildrenProp & { onClick?: () => void }) => (
	<tr
		onClick={onClick}
		className={onClick ? "cursor-pointer hover:bg-gray-50" : ""}
	>
		{children}
	</tr>
);
const TableHead = ({ children }: ChildrenProp) => (
	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
		{children}
	</th>
);
const TableCell = ({ children }: ChildrenProp) => (
	<td className="px-6 py-4 whitespace-nowrap text-sm">{children}</td>
);

// Stat card component
const StatCard = ({
	title,
	value,
	trend,
	className = "",
	children,
	...props
}: StatCardProps) => (
	<div
		className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
		{...props}
	>
		<div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
		<div className="mt-2 text-3xl font-semibold">{value}</div>
		{trend && (
			<div className="mt-2">
				<span
					className={`text-sm ${
						trend.positive ? "text-green-500" : "text-red-500"
					} flex items-center`}
				>
					{trend.positive ? "↑" : "↓"} {trend.value}% {trend.label}
				</span>
			</div>
		)}
		{children}
	</div>
);

// Add these new components
const ThreatScoreBadge = ({ score }: { score: number }) => {
	let bgColor = "bg-green-100";
	let textColor = "text-green-800";

	if (score >= 8.5) {
		bgColor = "bg-red-100";
		textColor = "text-red-800";
	} else if (score >= 6.5) {
		bgColor = "bg-orange-100";
		textColor = "text-orange-800";
	} else if (score >= 4.5) {
		bgColor = "bg-yellow-100";
		textColor = "text-yellow-800";
	}

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
		>
			{score.toFixed(1)}
		</span>
	);
};

const DashboardMetricCard = ({
	title,
	value,
	icon,
	trend,
	color = "blue",
}: {
	title: string;
	value: number | string;
	icon?: React.ReactNode;
	trend?: { value: number; label: string; positive: boolean };
	color?: "blue" | "green" | "red" | "purple" | "yellow";
}) => {
	const colors = {
		blue: "bg-blue-500 text-white",
		green: "bg-green-500 text-white",
		red: "bg-red-500 text-white",
		purple: "bg-purple-500 text-white",
		yellow: "bg-yellow-500 text-white",
	};

	return (
		<div className={`rounded-lg overflow-hidden shadow-lg ${colors[color]}`}>
			<div className="px-4 py-5 sm:p-6">
				<div className="flex items-center">
					{icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
					<div>
						<dt className="text-sm font-medium opacity-80 truncate">{title}</dt>
						<dd className="mt-1 text-3xl font-semibold">{value}</dd>
					</div>
				</div>
				{trend && (
					<div className="mt-2">
						<span
							className={`text-sm ${
								trend.positive ? "text-green-100" : "text-red-100"
							} flex items-center`}
						>
							{trend.positive ? "↑" : "↓"} {trend.value}% {trend.label}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default function Page() {
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "explorer" | "search" | "taxii"
	>("dashboard");
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<ThreatResult[]>([]);
	const [allIocs, setAllIocs] = useState<ThreatResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [taxiiLoading, setTaxiiLoading] = useState(false);
	const [error, setError] = useState("");
	const [taxiiError, setTaxiiError] = useState("");
	const [taxiiSuccess, setTaxiiSuccess] = useState("");
	const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
		totalThreats: 0,
		newThreats: 0,
		topDomains: [],
		topIPs: [],
		threatsByType: [],
	});
	const [taxiiStatus, setTaxiiStatus] = useState<TaxiiStatusData | null>(null);
	const [selectedIoc, setSelectedIoc] = useState<ThreatResult | null>(null);

	// Filters
	const [typeFilter, setTypeFilter] = useState("all");
	const [sourceFilter, setSourceFilter] = useState("all");
	const [timeFilter, setTimeFilter] = useState("all");

	// Load dashboard data on initial load
	useEffect(() => {
		fetchDashboardStats();
		fetchAllIocs();
	}, []);

	// Load TAXII status when the TAXII tab is active
	useEffect(() => {
		if (activeTab === "taxii") {
			fetchTaxiiStatus();
		}
	}, [activeTab]);

	const fetchDashboardStats = async () => {
		try {
			const response = await fetch("/api/tools/threat-intelligence/dashboard");
			if (response.ok) {
				const data = await response.json();
				setDashboardStats(data);
			}
		} catch (err) {
			console.error("Error fetching dashboard stats:", err);
		}
	};

	const fetchAllIocs = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/tools/threat-intelligence/iocs");
			if (response.ok) {
				const data = await response.json();
				setAllIocs(data.results || []);
			}
		} catch (err) {
			console.error("Error fetching IOCs:", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchTaxiiStatus = async () => {
		setTaxiiLoading(true);
		setTaxiiError("");
		try {
			const response = await fetch(
				"/api/tools/threat-intelligence/taxii-status"
			);
			if (response.ok) {
				const data = await response.json();
				setTaxiiStatus(data);
			} else {
				setTaxiiError(
					"Failed to load TAXII configuration. The server may not be available."
				);
			}
		} catch (err) {
			console.error("Error fetching TAXII status:", err);
			setTaxiiError("An error occurred while fetching TAXII configuration");
		} finally {
			setTaxiiLoading(false);
		}
	};

	const triggerTaxiiFetch = async () => {
		setTaxiiLoading(true);
		setTaxiiError("");
		setTaxiiSuccess("");
		try {
			const response = await fetch(
				"/api/tools/threat-intelligence/taxii-fetch",
				{
					method: "POST",
				}
			);

			if (response.ok) {
				const data = await response.json();
				setTaxiiSuccess(
					`Successfully fetched data. Added ${
						data.addedIocs
					} new threat indicators in ${Math.round(data.duration)} seconds.`
				);
				// Refresh TAXII status and dashboard stats
				fetchTaxiiStatus();
				fetchDashboardStats();
				fetchAllIocs();
			} else {
				const errorData = await response.json().catch(() => ({}));
				setTaxiiError(errorData.error || "Failed to fetch TAXII data");
			}
		} catch (err) {
			console.error("Error triggering TAXII fetch:", err);
			setTaxiiError("An error occurred while trying to fetch TAXII data");
		} finally {
			setTaxiiLoading(false);
		}
	};

	const searchThreat = async () => {
		if (!query.trim()) return;

		setLoading(true);
		setError("");

		try {
			const response = await fetch(
				`/api/tools/threat-intelligence/search?query=${encodeURIComponent(
					query
				)}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch threat intelligence data");
			}

			const data = await response.json();
			setResults(data.results || []);
			setActiveTab("search");
		} catch (err) {
			setError(
				"An error occurred while fetching threat data. Please try again."
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleIocClick = (ioc: ThreatResult) => {
		setSelectedIoc(ioc);
	};

	const handleBackToList = () => {
		setSelectedIoc(null);
	};

	const getFilteredIocs = () => {
		return allIocs.filter((ioc) => {
			const matchesType = typeFilter === "all" || ioc.type === typeFilter;
			const matchesSource =
				sourceFilter === "all" || ioc.source === sourceFilter;
			// Time filter would need actual implementation based on firstSeen/lastSeen
			return matchesType && matchesSource;
		});
	};

	const typeOptions = [
		{ value: "all", label: "All Types" },
		{ value: "ip", label: "IP Address" },
		{ value: "domain", label: "Domain" },
		{ value: "url", label: "URL" },
		{ value: "hash", label: "File Hash" },
		{ value: "email", label: "Email" },
	];

	const sourceOptions = [
		{ value: "all", label: "All Sources" },
		{ value: "alienvault", label: "AlienVault OTX" },
		{ value: "misp", label: "MISP" },
		{ value: "virustotal", label: "VirusTotal" },
		{ value: "threatfox", label: "ThreatFox" },
	];

	const timeOptions = [
		{ value: "all", label: "All Time" },
		{ value: "24h", label: "Last 24 Hours" },
		{ value: "7d", label: "Last 7 Days" },
		{ value: "30d", label: "Last 30 Days" },
		{ value: "90d", label: "Last 90 Days" },
	];

	// Render dashboard view
	const renderDashboard = () => (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<DashboardMetricCard
					title="Total Threats"
					value={dashboardStats.totalThreats}
					color="blue"
				/>
				<DashboardMetricCard
					title="New Threats (24h)"
					value={dashboardStats.newThreats}
					trend={{ value: 12, label: "vs previous day", positive: true }}
					color="green"
				/>
				<DashboardMetricCard
					title="Most Active Source"
					value={dashboardStats.mostActiveSource || "AlienVault OTX"}
					color="purple"
				/>
				<DashboardMetricCard
					title="Highest Risk Score"
					value={
						dashboardStats.highestRiskScore
							? `${dashboardStats.highestRiskScore}/10`
							: "9.8/10"
					}
					color="red"
				/>
			</div>

			{dashboardStats.isMockData && (
				<div className="mb-6">
					<SuccessAlert className="bg-amber-50 border-amber-200 text-amber-800">
						<AlertTitle className="text-amber-800">Using Demo Data</AlertTitle>
						<AlertDescription>
							The dashboard is currently displaying demo data. Connect to a real
							threat intelligence backend to see live data.
						</AlertDescription>
					</SuccessAlert>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">
							Top Malicious Domains
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<TableHead className="font-semibold">Domain</TableHead>
									<TableHead className="font-semibold text-right">
										Count
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardStats.topDomains.map((item, i) => (
									<TableRow
										key={i}
										className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<TableCell className="font-medium">{item.domain}</TableCell>
										<TableCell className="text-right">
											<Badge variant="outline">{item.count}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">
							Top Malicious IPs
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<TableHead className="font-semibold">IP Address</TableHead>
									<TableHead className="font-semibold text-right">
										Count
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardStats.topIPs.map((item, i) => (
									<TableRow
										key={i}
										className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<TableCell className="font-medium">{item.ip}</TableCell>
										<TableCell className="text-right">
											<Badge variant="outline">{item.count}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">Threats by Type</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						{dashboardStats.threatsByType.length > 0 ? (
							<div className="h-64">
								<Bar
									data={{
										labels: dashboardStats.threatsByType.map(
											(item) => item.type
										),
										datasets: [
											{
												label: "Count",
												data: dashboardStats.threatsByType.map(
													(item) => item.count
												),
												backgroundColor: [
													"rgba(255, 99, 132, 0.8)",
													"rgba(54, 162, 235, 0.8)",
													"rgba(255, 206, 86, 0.8)",
													"rgba(75, 192, 192, 0.8)",
													"rgba(153, 102, 255, 0.8)",
												],
												borderColor: [
													"rgba(255, 99, 132, 1)",
													"rgba(54, 162, 235, 1)",
													"rgba(255, 206, 86, 1)",
													"rgba(75, 192, 192, 1)",
													"rgba(153, 102, 255, 1)",
												],
												borderWidth: 1,
											},
										],
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												display: false,
											},
											title: {
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
						) : (
							<div className="flex items-center justify-center h-64 text-gray-500">
								No threat type data available
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">
							Distribution by Source
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="h-64 flex items-center justify-center">
							<div style={{ width: "100%", height: "100%", maxWidth: "250px" }}>
								<Pie
									data={{
										labels: dashboardStats.sourceDistribution
											? dashboardStats.sourceDistribution.map(
													(item) => item.source
											  )
											: [
													"AlienVault OTX",
													"MITRE ATT&CK",
													"ThreatFox",
													"MISP",
													"VirusTotal",
											  ],
										datasets: [
											{
												data: dashboardStats.sourceDistribution
													? dashboardStats.sourceDistribution.map(
															(item) => item.count
													  )
													: [42, 23, 15, 12, 8],
												backgroundColor: [
													"rgba(255, 99, 132, 0.8)",
													"rgba(54, 162, 235, 0.8)",
													"rgba(255, 206, 86, 0.8)",
													"rgba(75, 192, 192, 0.8)",
													"rgba(153, 102, 255, 0.8)",
												],
												borderColor: [
													"rgba(255, 99, 132, 1)",
													"rgba(54, 162, 235, 1)",
													"rgba(255, 206, 86, 1)",
													"rgba(75, 192, 192, 1)",
													"rgba(153, 102, 255, 1)",
												],
												borderWidth: 1,
											},
										],
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
									}}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);

	// Render IOC Explorer view
	const renderExplorer = () => {
		if (selectedIoc) {
			return (
				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<div className="flex justify-between items-center">
							<CardTitle className="text-xl font-bold">IOC Details</CardTitle>
							<Button
								onClick={handleBackToList}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
							>
								← Back to List
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Indicator
								</h3>
								<p className="mt-1 text-lg font-bold break-all">
									{selectedIoc.indicator}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Type
								</h3>
								<div className="mt-1">
									<Badge className="text-sm bg-blue-100 text-blue-800">
										{selectedIoc.type}
									</Badge>
								</div>
							</div>
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Threat Score
								</h3>
								<div className="mt-1 flex items-center">
									<div
										className="w-full bg-gray-200 rounded-full h-2.5 mr-2 dark:bg-gray-700"
										style={{ maxWidth: "150px" }}
									>
										<div
											className={`h-2.5 rounded-full ${
												selectedIoc.threatScore >= 8.5
													? "bg-red-600"
													: selectedIoc.threatScore >= 6.5
													? "bg-orange-500"
													: selectedIoc.threatScore >= 4.5
													? "bg-yellow-400"
													: "bg-green-500"
											}`}
											style={{
												width: `${(selectedIoc.threatScore / 10) * 100}%`,
											}}
										></div>
									</div>
									<span className="text-lg font-bold">
										{selectedIoc.threatScore}
									</span>
								</div>
							</div>
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Source
								</h3>
								<p className="mt-1 text-lg font-medium">{selectedIoc.source}</p>
							</div>
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									First Seen
								</h3>
								<p className="mt-1 text-base font-medium">
									{selectedIoc.firstSeen
										? new Date(selectedIoc.firstSeen).toLocaleString()
										: "Unknown"}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Last Seen
								</h3>
								<p className="mt-1 text-base font-medium">
									{selectedIoc.lastSeen
										? new Date(selectedIoc.lastSeen).toLocaleString()
										: "Unknown"}
								</p>
							</div>
						</div>

						{selectedIoc.sourceUrl && (
							<div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Source URL
								</h3>
								<a
									href={selectedIoc.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline break-all"
								>
									{selectedIoc.sourceUrl}
								</a>
							</div>
						)}

						{selectedIoc.sampleText && (
							<div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Description
								</h3>
								<div className="p-4 bg-white dark:bg-gray-800 rounded border text-sm">
									{selectedIoc.sampleText}
								</div>
							</div>
						)}

						{selectedIoc.tags && selectedIoc.tags.length > 0 && (
							<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Tags
								</h3>
								<div className="flex flex-wrap gap-2">
									{selectedIoc.tags.map((tag, i) => (
										<Badge
											key={i}
											className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
										>
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			);
		}

		const filteredIocs = getFilteredIocs();

		return (
			<>
				<Card className="mb-6 shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">
							IOC Explorer Filters
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Type
								</label>
								<Select
									value={typeFilter}
									onChange={(e) => setTypeFilter(e.target.value)}
									options={typeOptions}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Source
								</label>
								<Select
									value={sourceFilter}
									onChange={(e) => setSourceFilter(e.target.value)}
									options={sourceOptions}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Time Range
								</label>
								<Select
									value={timeFilter}
									onChange={(e) => setTimeFilter(e.target.value)}
									options={timeOptions}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<CardTitle className="text-lg font-bold">IOC Explorer</CardTitle>
						<CardDescription>
							Showing {filteredIocs.length} indicators of compromise
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<TableHead className="font-semibold">Indicator</TableHead>
									<TableHead className="font-semibold">Type</TableHead>
									<TableHead className="font-semibold">Threat Score</TableHead>
									<TableHead className="font-semibold">Source</TableHead>
									<TableHead className="font-semibold">First Seen</TableHead>
									<TableHead className="font-semibold">Last Seen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredIocs.map((ioc, index) => (
									<TableRow
										key={index}
										onClick={() => handleIocClick(ioc)}
										className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<TableCell className="font-medium">
											{ioc.indicator}
										</TableCell>
										<TableCell>
											<Badge variant="outline">{ioc.type}</Badge>
										</TableCell>
										<TableCell>
											<ThreatScoreBadge score={ioc.threatScore} />
										</TableCell>
										<TableCell>{ioc.source}</TableCell>
										<TableCell>
											{ioc.firstSeen
												? new Date(ioc.firstSeen).toLocaleDateString()
												: "-"}
										</TableCell>
										<TableCell>
											{ioc.lastSeen
												? new Date(ioc.lastSeen).toLocaleDateString()
												: "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</>
		);
	};

	// Render TAXII configuration view
	const renderTaxii = () => (
		<div>
			{taxiiError && (
				<Alert>
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{taxiiError}</AlertDescription>
				</Alert>
			)}

			{taxiiSuccess && (
				<SuccessAlert>
					<AlertTitle>Success</AlertTitle>
					<AlertDescription>{taxiiSuccess}</AlertDescription>
				</SuccessAlert>
			)}

			<Card className="mb-6">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>TAXII Intelligence Feeds</CardTitle>
						<Button
							onClick={triggerTaxiiFetch}
							disabled={taxiiLoading}
							className="bg-green-600 hover:bg-green-700"
						>
							{taxiiLoading ? "Fetching..." : "Fetch Now"}
						</Button>
					</div>
					<CardDescription>
						Configured TAXII servers for fetching threat intelligence
					</CardDescription>
				</CardHeader>
				<CardContent>
					{taxiiLoading && !taxiiStatus ? (
						<div className="text-center py-4">
							Loading TAXII configuration...
						</div>
					) : (
						<>
							{taxiiStatus &&
							taxiiStatus.taxiSources &&
							taxiiStatus.taxiSources.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Source</TableHead>
											<TableHead>Collection</TableHead>
											<TableHead>URL</TableHead>
											<TableHead>IOC Count</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{taxiiStatus.taxiSources.map((source, i) => (
											<TableRow key={i}>
												<TableCell>{source.name}</TableCell>
												<TableCell>{source.collection}</TableCell>
												<TableCell className="text-xs">{source.url}</TableCell>
												<TableCell>{source.iocCount}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-4 text-gray-500">
									No TAXII sources configured or available
								</div>
							)}

							<div className="mt-6">
								<h3 className="text-lg font-medium mb-2">
									How to Configure TAXII Sources
								</h3>
								<div className="p-4 bg-gray-50 rounded border text-sm">
									<p>
										TAXII servers can be configured in the server environment
										using the <code>TAXII_SERVERS</code> environment variable.
										This should be a JSON array with server configurations.
									</p>
									<p className="mt-2">Example configuration:</p>
									<pre className="p-3 bg-gray-100 rounded mt-2 overflow-x-auto">
										{`TAXII_SERVERS=[
  {
    "name": "MITRE ATT&CK",
    "url": "https://cti-taxii.mitre.org/taxii/",
    "version": "2.1",
    "collection_name": "enterprise-attack",
    "username": null,
    "password": null
  },
  {
    "name": "AlienVault OTX",
    "url": "https://otx.alienvault.com/taxii/",
    "version": "2.0",
    "collection_name": "user_AlienVault",
    "username": "your_email",
    "password": "your_api_key"
  }
]`}
									</pre>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{taxiiStatus &&
				taxiiStatus.recentRuns &&
				taxiiStatus.recentRuns.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Recent TAXII Sync Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Timestamp</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>IOCs Added</TableHead>
										<TableHead>IOCs Updated</TableHead>
										<TableHead>Error</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{taxiiStatus.recentRuns.map((run, i) => (
										<TableRow key={i}>
											<TableCell>
												{new Date(run.timestamp).toLocaleString()}
											</TableCell>
											<TableCell>
												<Badge
													className={
														run.status === "completed"
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}
												>
													{run.status}
												</Badge>
											</TableCell>
											<TableCell>{run.itemsAdded}</TableCell>
											<TableCell>{run.itemsUpdated}</TableCell>
											<TableCell className="text-xs text-red-600">
												{run.error || "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
		</div>
	);

	// Render search results
	const renderSearchResults = () => (
		<>
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Search Threats</CardTitle>
					<CardDescription>
						Enter an IP address, domain, URL, file hash, or other indicator to
						search for threat intelligence.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2">
						<Input
							placeholder="Enter search query..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && searchThreat()}
							className="flex-1"
						/>
						<Button onClick={searchThreat} disabled={loading}>
							{loading ? "Searching..." : "Search"}
							{!loading && <span className="ml-2">🔍</span>}
						</Button>
					</div>
				</CardContent>
			</Card>

			{error && (
				<Alert>
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{results.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Search Results</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Indicator</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Threat Score</TableHead>
									<TableHead>Source</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{results.map((result, index) => (
									<TableRow key={index} onClick={() => handleIocClick(result)}>
										<TableCell>{result.indicator || "-"}</TableCell>
										<TableCell>{result.type || "-"}</TableCell>
										<TableCell>{result.threatScore || "-"}</TableCell>
										<TableCell>{result.source || "-"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
					<CardFooter className="text-sm text-gray-500">
						Showing {results.length} results
					</CardFooter>
				</Card>
			) : (
				<div className="text-center py-12 text-gray-500">
					{loading
						? "Searching for threats..."
						: "Enter a search query to find threat intelligence data"}
				</div>
			)}
		</>
	);

	return (
		<div className="container mx-auto py-8 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Threat Intelligence Platform
				</h1>
				<div className="flex space-x-2">
					<Button
						onClick={() => fetchAllIocs()}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
					>
						Refresh Data
					</Button>
				</div>
			</div>

			<div className="mb-6 border-b dark:border-gray-700">
				<div className="flex space-x-1 overflow-x-auto">
					<Tab
						active={activeTab === "dashboard"}
						onClick={() => setActiveTab("dashboard")}
					>
						Dashboard
					</Tab>
					<Tab
						active={activeTab === "explorer"}
						onClick={() => setActiveTab("explorer")}
					>
						IOC Explorer
					</Tab>
					<Tab
						active={activeTab === "search"}
						onClick={() => setActiveTab("search")}
					>
						Search
					</Tab>
					<Tab
						active={activeTab === "taxii"}
						onClick={() => setActiveTab("taxii")}
					>
						TAXII Config
					</Tab>
				</div>
			</div>

			{activeTab === "dashboard" && renderDashboard()}
			{activeTab === "explorer" && renderExplorer()}
			{activeTab === "search" && renderSearchResults()}
			{activeTab === "taxii" && renderTaxii()}
		</div>
	);
}
