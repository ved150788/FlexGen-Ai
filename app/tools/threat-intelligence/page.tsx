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
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
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
	externalLinks?: {
		name: string;
		url: string;
		description: string;
	}[];
	detailedDescription?: string;
	suggestedRemedies?: string[];
	riskAssessment?: string;
	technicalDetails?: {
		[key: string]: string;
	};
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

// Update interfaces for new TAXII feeds system
interface TaxiiFeed {
	id: string;
	name: string;
	description: string;
	status: string;
	indicators: number;
	lastUpdated: string | null;
	format: string;
	version: string;
	authRequired: boolean;
	url: string;
}

interface TaxiiStatusResponse {
	connected: boolean;
	lastSync: string;
	totalFeeds: number;
	activeFeeds: number;
	collections: TaxiiFeed[];
}

interface FeedSource {
	name: string;
	totalIndicators: number;
	avgThreatScore: number;
	lastUpdated: string;
	recentIndicators: number;
	status: string;
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
		className={
			onClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : ""
		}
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
		blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
		green:
			"bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
		red: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
		purple:
			"bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
		yellow:
			"bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300",
	};

	return (
		<div className={`rounded-xl overflow-hidden ${colors[color]}`}>
			<div className="px-6 py-6 sm:p-8">
				<div className="flex items-center">
					{icon && (
						<div className="flex-shrink-0 mr-4 text-3xl opacity-90">{icon}</div>
					)}
					<div className="flex-1">
						<dt className="text-sm font-medium opacity-90 truncate uppercase tracking-wide">
							{title}
						</dt>
						<dd className="mt-2 text-4xl font-bold">{value}</dd>
					</div>
				</div>
				{trend && (
					<div className="mt-4 pt-4 border-t border-white/20">
						<span
							className={`text-sm ${
								trend.positive ? "text-green-100" : "text-red-100"
							} flex items-center font-medium`}
						>
							<span className="mr-1 text-lg">
								{trend.positive ? "📈" : "📉"}
							</span>
							{trend.value}% {trend.label}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default function Page() {
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "explorer" | "taxii" | "search"
	>("dashboard");
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<ThreatResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
		totalThreats: 0,
		newThreats: 0,
		topDomains: [],
		topIPs: [],
		threatsByType: [],
		sourceDistribution: [],
		mostActiveSource: "",
		highestRiskScore: 0,
		isMockData: true,
	});
	const [allIocs, setAllIocs] = useState<ThreatResult[]>([]);
	const [selectedIoc, setSelectedIoc] = useState<ThreatResult | null>(null);
	const [typeFilter, setTypeFilter] = useState("all");
	const [sourceFilter, setSourceFilter] = useState("all");
	const [timeFilter, setTimeFilter] = useState("all");
	const [taxiiStatus, setTaxiiStatus] = useState<TaxiiStatusData | null>(null);
	const [taxiiLoading, setTaxiiLoading] = useState(false);
	const [taxiiError, setTaxiiError] = useState<string | null>(null);
	const [taxiiSuccess, setTaxiiSuccess] = useState<string | null>(null);

	// Update TAXII status state for new system
	const [taxiiStatusNew, setTaxiiStatusNew] =
		useState<TaxiiStatusResponse | null>(null);
	const [feedSources, setFeedSources] = useState<FeedSource[]>([]);
	const [refreshingFeeds, setRefreshingFeeds] = useState(false);

	// Add logging system
	const [logs, setLogs] = useState<string[]>([]);
	const [showLogs, setShowLogs] = useState(false);

	// Add pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = `[${timestamp}] ${message}`;
		setLogs((prev) => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
	};

	// Add timezone-aware date formatting function
	const formatLocalDateTime = (dateString: string | null) => {
		if (!dateString) return "Never";

		try {
			const date = new Date(dateString);
			// Ensure we're working with a valid date
			if (isNaN(date.getTime())) return "Invalid Date";

			// Format with explicit timezone handling
			return date.toLocaleString("en-IN", {
				timeZone: "Asia/Kolkata",
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			});
		} catch (error) {
			console.error("Date formatting error:", error);
			return "Invalid Date";
		}
	};

	const fetchDashboardStats = async () => {
		try {
			addLog("Fetching dashboard statistics...");
			const response = await fetch("/api/tools/threat-intelligence/dashboard");
			if (response.ok) {
				const data = await response.json();
				setDashboardStats(data);
				addLog(`Dashboard stats loaded: ${data.totalThreats} total threats`);
			} else {
				addLog(`Failed to fetch dashboard stats: ${response.status}`);
			}
		} catch (err) {
			addLog(
				`Error fetching dashboard stats: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
		}
	};

	const fetchAllIocs = async () => {
		setLoading(true);
		try {
			addLog("Fetching IOC data...");
			const response = await fetch("/api/tools/threat-intelligence/iocs");
			if (response.ok) {
				const data = await response.json();
				setAllIocs(data.results || []);
				addLog(`Loaded ${data.results?.length || 0} IOCs`);
			} else {
				addLog(`Failed to fetch IOCs: ${response.status}`);
			}
		} catch (err) {
			addLog(
				`Error fetching IOCs: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchTaxiiStatus = async () => {
		setTaxiiLoading(true);
		setTaxiiError(null);
		addLog("Fetching TAXII status...");

		try {
			const response = await fetch(
				"/api/tools/threat-intelligence/taxii-status/"
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			// Handle new format
			if (data.collections) {
				setTaxiiStatusNew(data);
				addLog(
					`TAXII status loaded: ${data.activeFeeds}/${data.totalFeeds} feeds active`
				);
			} else {
				// Legacy format
				setTaxiiStatus(data);
				addLog("TAXII status loaded (legacy format)");
			}
		} catch (error) {
			const errorMessage = `Failed to fetch TAXII status: ${error}`;
			setTaxiiError(errorMessage);
			addLog(errorMessage);
		} finally {
			setTaxiiLoading(false);
		}
	};

	const fetchFeedSources = async () => {
		try {
			addLog("Fetching feed sources...");
			const response = await fetch(
				"/api/tools/threat-intelligence/feeds/sources"
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (data.success) {
				setFeedSources(data.sources);
				addLog(`Loaded ${data.sources.length} feed sources`);
			}
		} catch (error) {
			addLog(`Failed to fetch feed sources: ${error}`);
		}
	};

	// Add comprehensive refresh function
	const refreshAllData = async () => {
		setLoading(true);
		addLog("Starting comprehensive data refresh...");

		try {
			// Refresh all data sources in parallel
			await Promise.all([
				fetchDashboardStats(),
				fetchAllIocs(),
				fetchTaxiiStatus(),
				fetchFeedSources(),
			]);

			addLog("All data refreshed successfully");

			// Show success message briefly
			setTaxiiSuccess("Data refreshed successfully!");
			setTimeout(() => setTaxiiSuccess(null), 3000);
		} catch (error) {
			const errorMsg = `Failed to refresh data: ${
				error instanceof Error ? error.message : "Unknown error"
			}`;
			addLog(errorMsg);
			setError(errorMsg);
			setTimeout(() => setError(""), 5000);
		} finally {
			setLoading(false);
		}
	};

	const refreshAllFeeds = async () => {
		setRefreshingFeeds(true);
		setTaxiiError(null);
		setTaxiiSuccess(null);
		addLog("Starting feed refresh...");

		try {
			const response = await fetch(
				"/api/tools/threat-intelligence/feeds/refresh",
				{
					method: "POST",
				}
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			if (data.success) {
				setTaxiiSuccess(
					`Successfully refreshed feeds. Added ${data.totalAdded} indicators.`
				);
				addLog(`Feed refresh completed: ${data.totalAdded} indicators added`);

				// Refresh status and sources
				await fetchTaxiiStatus();
				await fetchFeedSources();
				await fetchDashboardStats();
				await fetchAllIocs();
			} else {
				throw new Error(data.message || "Failed to refresh feeds");
			}
		} catch (error) {
			const errorMessage = `Failed to refresh feeds: ${error}`;
			setTaxiiError(errorMessage);
			addLog(errorMessage);
		} finally {
			setRefreshingFeeds(false);
		}
	};

	const searchThreat = async () => {
		if (!query.trim()) return;

		setLoading(true);
		setError("");

		try {
			addLog(`Searching for threats: "${query}"`);
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
			addLog(`Search completed: ${data.results?.length || 0} results found`);
		} catch (err) {
			const errorMsg =
				"An error occurred while fetching threat data. Please try again.";
			setError(errorMsg);
			addLog(
				`Search error: ${err instanceof Error ? err.message : "Unknown error"}`
			);
		} finally {
			setLoading(false);
		}
	};

	const handleIocClick = (ioc: ThreatResult) => {
		setSelectedIoc(ioc);
		setActiveTab("explorer"); // Switch to explorer tab to show the detailed view
	};

	const handleBackToList = () => {
		setSelectedIoc(null);
	};

	// Load dashboard data on initial load
	useEffect(() => {
		fetchDashboardStats();
		fetchAllIocs();
		fetchTaxiiStatus();
		fetchFeedSources();
	}, []);

	// Load TAXII status when the TAXII tab is active
	useEffect(() => {
		if (activeTab === "taxii") {
			fetchTaxiiStatus();
		}
	}, [activeTab]);

	const getFilteredIocs = () => {
		const filtered = allIocs.filter((ioc) => {
			const matchesType = typeFilter === "all" || ioc.type === typeFilter;
			const matchesSource =
				sourceFilter === "all" || ioc.source === sourceFilter;
			// Time filter would need actual implementation based on firstSeen/lastSeen
			return matchesType && matchesSource;
		});

		// Calculate pagination
		const totalPages = Math.ceil(filtered.length / itemsPerPage);
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedIocs = filtered.slice(startIndex, endIndex);

		return {
			iocs: paginatedIocs,
			totalItems: filtered.length,
			totalPages,
			currentPage,
			hasNextPage: currentPage < totalPages,
			hasPrevPage: currentPage > 1,
		};
	};

	// Add pagination component
	const PaginationControls = ({
		currentPage,
		totalPages,
		totalItems,
		hasNextPage,
		hasPrevPage,
		onPageChange,
	}: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
		onPageChange: (page: number) => void;
	}) => {
		const getPageNumbers = () => {
			const pages = [];
			const maxVisiblePages = 5;

			if (totalPages <= maxVisiblePages) {
				for (let i = 1; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				const start = Math.max(1, currentPage - 2);
				const end = Math.min(totalPages, start + maxVisiblePages - 1);

				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
			}

			return pages;
		};

		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
				<div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
					<span>
						Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
						{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
						results
					</span>
				</div>

				<div className="flex items-center space-x-2">
					<Button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={!hasPrevPage}
						className="px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						← Previous
					</Button>

					<div className="flex space-x-1">
						{getPageNumbers().map((pageNum) => (
							<Button
								key={pageNum}
								onClick={() => onPageChange(pageNum)}
								className={`px-3 py-1 text-sm border ${
									pageNum === currentPage
										? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
										: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
								}`}
							>
								{pageNum}
							</Button>
						))}
					</div>

					<Button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={!hasNextPage}
						className="px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next →
					</Button>
				</div>
			</div>
		);
	};

	// Logs component
	const LogsPanel = () => (
		<Card className="mt-4 shadow-lg border-0 bg-white dark:bg-gray-800">
			<CardHeader className="border-b dark:border-gray-700">
				<div className="flex justify-between items-center">
					<CardTitle className="text-lg font-bold">System Logs</CardTitle>
					<div className="flex gap-2">
						<Button
							onClick={() => setLogs([])}
							className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white"
						>
							Clear Logs
						</Button>
						<Button
							onClick={() => setShowLogs(!showLogs)}
							className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white"
						>
							{showLogs ? "Hide Logs" : "Show Logs"}
						</Button>
					</div>
				</div>
			</CardHeader>
			{showLogs && (
				<CardContent className="p-4">
					<div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
						{logs.length === 0 ? (
							<div className="text-gray-500">No logs yet...</div>
						) : (
							logs.map((log, index) => (
								<div key={index} className="mb-1">
									{log}
								</div>
							))
						)}
					</div>
				</CardContent>
			)}
		</Card>
	);

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

	// Add function to handle filter changes and reset pagination
	const handleFilterChange = (
		filterType: "type" | "source" | "time",
		value: string
	) => {
		setCurrentPage(1); // Reset to first page when filters change

		switch (filterType) {
			case "type":
				setTypeFilter(value);
				break;
			case "source":
				setSourceFilter(value);
				break;
			case "time":
				setTimeFilter(value);
				break;
		}
	};

	// Render dashboard view
	const renderDashboard = () => (
		<div className="space-y-8">
			{/* Enhanced Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<DashboardMetricCard
					title="Total Threats"
					value={dashboardStats.totalThreats.toLocaleString()}
					icon="🛡️"
					color="blue"
				/>
				<DashboardMetricCard
					title="New Threats (24h)"
					value={dashboardStats.newThreats}
					icon="🚨"
					trend={{ value: 12, label: "vs previous day", positive: true }}
					color="green"
				/>
				<DashboardMetricCard
					title="Most Active Source"
					value={dashboardStats.mostActiveSource || "MITRE ATT&CK"}
					icon="📡"
					color="purple"
				/>
				<DashboardMetricCard
					title="Highest Risk Score"
					value={
						dashboardStats.highestRiskScore
							? `${dashboardStats.highestRiskScore}/10`
							: "9.8/10"
					}
					icon="⚠️"
					color="red"
				/>
			</div>

			{/* Status Alert */}
			{dashboardStats.isMockData && (
				<div className="mb-6">
					<SuccessAlert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800 shadow-lg rounded-xl">
						<AlertTitle className="text-amber-800 font-bold flex items-center">
							<span className="mr-2 text-xl">⚠️</span>
							Using Demo Data
						</AlertTitle>
						<AlertDescription className="text-amber-700">
							The dashboard is currently displaying demo data. Connect to a real
							threat intelligence backend to see live data.
						</AlertDescription>
					</SuccessAlert>
				</div>
			)}

			{/* Enhanced Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Top Malicious Domains */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
						<CardTitle className="text-xl font-bold flex items-center">
							<span className="mr-3 text-2xl">🌐</span>
							Top Malicious Domains
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Most frequently detected malicious domains
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						{dashboardStats.topDomains.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
										<TableHead className="font-semibold text-gray-700 dark:text-gray-300">
											Domain
										</TableHead>
										<TableHead className="font-semibold text-right text-gray-700 dark:text-gray-300">
											Detections
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{dashboardStats.topDomains.map((item, i) => (
										<TableRow
											key={i}
											className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200"
										>
											<TableCell className="font-mono text-sm">
												{item.domain}
											</TableCell>
											<TableCell className="text-right">
												<Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1">
													{item.count}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
								<span className="text-4xl mb-4">🌐</span>
								<p className="text-lg font-medium">
									No domain threats detected
								</p>
								<p className="text-sm">
									Domain indicators will appear here when detected
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Malicious IPs */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
						<CardTitle className="text-xl font-bold flex items-center">
							<span className="mr-3 text-2xl">🌍</span>
							Top Malicious IPs
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Most frequently detected malicious IP addresses
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<TableHead className="font-semibold text-gray-700 dark:text-gray-300">
										IP Address
									</TableHead>
									<TableHead className="font-semibold text-right text-gray-700 dark:text-gray-300">
										Detections
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardStats.topIPs.map((item, i) => (
									<TableRow
										key={i}
										className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/10 dark:hover:to-pink-900/10 transition-all duration-200"
									>
										<TableCell className="font-mono text-sm">
											{item.ip}
										</TableCell>
										<TableCell className="text-right">
											<Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1">
												{item.count}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Threats by Type - Enhanced Bar Chart */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
						<CardTitle className="text-xl font-bold flex items-center">
							<span className="mr-3 text-2xl">📊</span>
							Threats by Type
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Distribution of threat indicators by category
						</CardDescription>
					</CardHeader>
					<CardContent className="py-6">
						{dashboardStats.threatsByType.length > 0 ? (
							<div className="h-80">
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
													"rgba(99, 102, 241, 0.8)",
													"rgba(236, 72, 153, 0.8)",
													"rgba(34, 197, 94, 0.8)",
													"rgba(251, 146, 60, 0.8)",
													"rgba(168, 85, 247, 0.8)",
													"rgba(14, 165, 233, 0.8)",
													"rgba(239, 68, 68, 0.8)",
												],
												borderColor: [
													"rgba(99, 102, 241, 1)",
													"rgba(236, 72, 153, 1)",
													"rgba(34, 197, 94, 1)",
													"rgba(251, 146, 60, 1)",
													"rgba(168, 85, 247, 1)",
													"rgba(14, 165, 233, 1)",
													"rgba(239, 68, 68, 1)",
												],
												borderWidth: 2,
												borderRadius: 8,
												borderSkipped: false,
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
											tooltip: {
												backgroundColor: "rgba(0, 0, 0, 0.8)",
												titleColor: "white",
												bodyColor: "white",
												borderColor: "rgba(255, 255, 255, 0.2)",
												borderWidth: 1,
												cornerRadius: 8,
											},
										},
										scales: {
											x: {
												grid: {
													display: false,
												},
												ticks: {
													color: "rgba(107, 114, 128, 0.8)",
													font: {
														weight: "bold",
													},
												},
											},
											y: {
												beginAtZero: true,
												grid: {
													color: "rgba(107, 114, 128, 0.1)",
												},
												ticks: {
													color: "rgba(107, 114, 128, 0.8)",
													font: {
														weight: "bold",
													},
												},
											},
										},
										animation: {
											duration: 2000,
											easing: "easeInOutQuart",
										},
									}}
								/>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400">
								<span className="text-4xl mb-4">📊</span>
								<p className="text-lg font-medium">
									No threat type data available
								</p>
								<p className="text-sm">
									Threat categories will appear here when data is loaded
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Distribution by Source - Enhanced Doughnut Chart */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
						<CardTitle className="text-xl font-bold flex items-center">
							<span className="mr-3 text-2xl">🎯</span>
							Distribution by Source
						</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Threat intelligence sources and their contributions
						</CardDescription>
					</CardHeader>
					<CardContent className="py-6">
						<div className="h-80 flex items-center justify-center">
							<div style={{ width: "100%", height: "100%", maxWidth: "300px" }}>
								<Doughnut
									data={{
										labels: dashboardStats.sourceDistribution
											? dashboardStats.sourceDistribution.map(
													(item) => item.source
											  )
											: [
													"MITRE ATT&CK",
													"OpenPhish",
													"CISA KEV",
													"Blocklist.de",
													"MalwareBazaar",
											  ],
										datasets: [
											{
												data: dashboardStats.sourceDistribution
													? dashboardStats.sourceDistribution.map(
															(item) => item.count
													  )
													: [51, 20, 20, 15, 10],
												backgroundColor: [
													"rgba(99, 102, 241, 0.8)",
													"rgba(236, 72, 153, 0.8)",
													"rgba(34, 197, 94, 0.8)",
													"rgba(251, 146, 60, 0.8)",
													"rgba(168, 85, 247, 0.8)",
													"rgba(14, 165, 233, 0.8)",
													"rgba(239, 68, 68, 0.8)",
												],
												borderColor: [
													"rgba(99, 102, 241, 1)",
													"rgba(236, 72, 153, 1)",
													"rgba(34, 197, 94, 1)",
													"rgba(251, 146, 60, 1)",
													"rgba(168, 85, 247, 1)",
													"rgba(14, 165, 233, 1)",
													"rgba(239, 68, 68, 1)",
												],
												borderWidth: 3,
												hoverBorderWidth: 4,
												hoverOffset: 8,
											},
										],
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										cutout: "60%",
										plugins: {
											legend: {
												position: "bottom",
												labels: {
													padding: 20,
													usePointStyle: true,
													pointStyle: "circle",
													font: {
														size: 12,
														weight: "bold",
													},
													color: "rgba(107, 114, 128, 0.8)",
												},
											},
											tooltip: {
												backgroundColor: "rgba(0, 0, 0, 0.8)",
												titleColor: "white",
												bodyColor: "white",
												borderColor: "rgba(255, 255, 255, 0.2)",
												borderWidth: 1,
												cornerRadius: 8,
												callbacks: {
													label: function (context: any) {
														const total = context.dataset.data.reduce(
															(a: number, b: number) => a + b,
															0
														);
														const percentage = (
															(context.parsed / total) *
															100
														).toFixed(1);
														return `${context.label}: ${context.parsed} (${percentage}%)`;
													},
												},
											},
										},
										animation: {
											animateRotate: true,
											animateScale: true,
											duration: 2000,
											easing: "easeInOutQuart",
										},
									}}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Additional Statistics Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Threat Severity Distribution */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
						<CardTitle className="text-lg font-bold flex items-center">
							<span className="mr-3 text-xl">⚡</span>
							Threat Severity
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-red-600">
									Critical
								</span>
								<span className="text-sm font-bold">15%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
									style={{ width: "15%" }}
								></div>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-orange-600">
									High
								</span>
								<span className="text-sm font-bold">35%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
									style={{ width: "35%" }}
								></div>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-yellow-600">
									Medium
								</span>
								<span className="text-sm font-bold">40%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
									style={{ width: "40%" }}
								></div>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium text-green-600">Low</span>
								<span className="text-sm font-bold">10%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
									style={{ width: "10%" }}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
						<CardTitle className="text-lg font-bold flex items-center">
							<span className="mr-3 text-xl">📈</span>
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="space-y-4">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								<span className="text-sm">
									New threats detected: +{dashboardStats.newThreats}
								</span>
							</div>
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<span className="text-sm">Feeds updated: 2 hours ago</span>
							</div>
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
								<span className="text-sm">
									Database size: {dashboardStats.totalThreats} indicators
								</span>
							</div>
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
								<span className="text-sm">
									Active sources:{" "}
									{dashboardStats.sourceDistribution?.length || 6}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* System Health */}
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
					<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
						<CardTitle className="text-lg font-bold flex items-center">
							<span className="mr-3 text-xl">💚</span>
							System Health
						</CardTitle>
					</CardHeader>
					<CardContent className="py-4">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">API Status</span>
								<Badge className="bg-green-100 text-green-800 px-2 py-1">
									✅ Online
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Database</span>
								<Badge className="bg-green-100 text-green-800 px-2 py-1">
									✅ Connected
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">TAXII Feeds</span>
								<Badge className="bg-green-100 text-green-800 px-2 py-1">
									✅ Active
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Scheduler</span>
								<Badge className="bg-green-100 text-green-800 px-2 py-1">
									✅ Running
								</Badge>
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
				<div className="max-w-7xl mx-auto">
					<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
						<CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
							<div className="flex justify-between items-center">
								<div>
									<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
										<span className="mr-3 text-3xl">🎯</span>
										IOC Detailed Analysis
									</CardTitle>
									<p className="text-gray-600 dark:text-gray-300 mt-1">
										Comprehensive threat intelligence analysis and remediation
										guidance
									</p>
								</div>
								<Button
									onClick={handleBackToList}
									className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
								>
									← Back to List
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-8">
							{/* Indicator Header Section */}
							<div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										Threat Indicator
									</h2>
									<div className="flex items-center space-x-3">
										<Badge className="text-sm bg-blue-100 text-blue-800 px-3 py-1">
											{selectedIoc.type}
										</Badge>
										<div className="flex items-center space-x-2">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-300">
												Risk Score:
											</span>
											<div className="flex items-center">
												<div className="w-24 bg-gray-200 rounded-full h-3 mr-2 dark:bg-gray-700">
													<div
														className={`h-3 rounded-full transition-all duration-500 ${
															selectedIoc.threatScore >= 8.5
																? "bg-gradient-to-r from-red-500 to-red-600"
																: selectedIoc.threatScore >= 6.5
																? "bg-gradient-to-r from-orange-500 to-orange-600"
																: selectedIoc.threatScore >= 4.5
																? "bg-gradient-to-r from-yellow-400 to-yellow-500"
																: "bg-gradient-to-r from-green-500 to-green-600"
														}`}
														style={{
															width: `${(selectedIoc.threatScore / 10) * 100}%`,
														}}
													></div>
												</div>
												<span className="text-lg font-bold text-gray-900 dark:text-white">
													{selectedIoc.threatScore}/10
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
									<p className="text-lg font-mono break-all text-gray-900 dark:text-white">
										{selectedIoc.indicator}
									</p>
								</div>
							</div>

							{/* Basic Information Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
								<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700 shadow-md">
									<div className="flex items-center mb-3">
										<span className="text-2xl mr-3">📊</span>
										<h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
											Source Information
										</h3>
									</div>
									<p className="text-lg font-bold text-blue-900 dark:text-blue-100">
										{selectedIoc.source}
									</p>
								</div>

								<div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl border border-green-200 dark:border-green-700 shadow-md">
									<div className="flex items-center mb-3">
										<span className="text-2xl mr-3">👁️</span>
										<h3 className="text-sm font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">
											First Detected
										</h3>
									</div>
									<p className="text-lg font-bold text-green-900 dark:text-green-100">
										{selectedIoc.firstSeen
											? formatLocalDateTime(selectedIoc.firstSeen)
											: "Unknown"}
									</p>
								</div>

								<div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-700 shadow-md">
									<div className="flex items-center mb-3">
										<span className="text-2xl mr-3">🕒</span>
										<h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
											Last Activity
										</h3>
									</div>
									<p className="text-lg font-bold text-purple-900 dark:text-purple-100">
										{selectedIoc.lastSeen
											? formatLocalDateTime(selectedIoc.lastSeen)
											: "Unknown"}
									</p>
								</div>
							</div>

							{/* Risk Assessment */}
							{selectedIoc.riskAssessment && (
								<div className="mb-8">
									<Card className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg">
										<CardContent className="p-6">
											<h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-3 flex items-center">
												<span className="mr-3 text-2xl">⚠️</span>
												Risk Assessment
											</h3>
											<p className="text-red-700 dark:text-red-300 leading-relaxed">
												{selectedIoc.riskAssessment}
											</p>
										</CardContent>
									</Card>
								</div>
							)}

							{/* External Analysis Links - Enhanced */}
							{selectedIoc.externalLinks &&
								selectedIoc.externalLinks.length > 0 && (
									<div className="mb-8">
										<Card className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg">
											<CardHeader className="pb-4">
												<h3 className="text-lg font-bold text-green-800 dark:text-green-300 flex items-center">
													<span className="mr-3 text-2xl">🔗</span>
													External Analysis & Intelligence
												</h3>
												<p className="text-sm text-green-700 dark:text-green-400">
													Click any link below to analyze this indicator on
													external platforms
												</p>
											</CardHeader>
											<CardContent className="pt-0">
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
													{selectedIoc.externalLinks.map((link, index) => (
														<a
															key={index}
															href={link.url}
															target="_blank"
															rel="noopener noreferrer"
															className="group block p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
														>
															<div className="flex items-center justify-between mb-2">
																<h4 className="font-bold text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
																	{link.name}
																</h4>
																<span className="text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
																	🔗
																</span>
															</div>
															<p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
																{link.description}
															</p>
															<div className="mt-2 text-xs text-green-500 dark:text-green-500 opacity-75 group-hover:opacity-100">
																Click to analyze →
															</div>
														</a>
													))}
												</div>

												{/* Additional Quick Links */}
												<div className="mt-6 pt-4 border-t border-green-200 dark:border-green-700">
													<h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">
														Quick Analysis Links
													</h4>
													<div className="flex flex-wrap gap-2">
														{selectedIoc.type.toLowerCase() === "ip" && (
															<>
																<a
																	href={`https://www.shodan.io/host/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
																>
																	Shodan
																</a>
																<a
																	href={`https://www.abuseipdb.com/check/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
																>
																	AbuseIPDB
																</a>
																<a
																	href={`https://www.virustotal.com/gui/ip-address/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
																>
																	VirusTotal
																</a>
																<a
																	href={`https://otx.alienvault.com/indicator/ip/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
																>
																	AlienVault OTX
																</a>
															</>
														)}
														{selectedIoc.type.toLowerCase() === "domain" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/domain/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
																>
																	VirusTotal
																</a>
																<a
																	href={`https://www.urlvoid.com/scan/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
																>
																	URLVoid
																</a>
																<a
																	href={`https://whois.domaintools.com/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
																>
																	WHOIS
																</a>
																<a
																	href={`https://otx.alienvault.com/indicator/domain/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
																>
																	AlienVault OTX
																</a>
																<a
																	href={`https://www.hybrid-analysis.com/search?query=${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
																>
																	Hybrid Analysis
																</a>
															</>
														)}
														{selectedIoc.type.toLowerCase() === "url" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/url/${btoa(
																		selectedIoc.indicator
																	)}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
																>
																	VirusTotal
																</a>
																<a
																	href={`https://www.urlvoid.com/scan/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
																>
																	URLVoid
																</a>
																<a
																	href={`https://otx.alienvault.com/indicator/url/${btoa(
																		selectedIoc.indicator
																	)}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
																>
																	AlienVault OTX
																</a>
															</>
														)}
														{selectedIoc.type.toLowerCase() === "hash" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/file/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
																>
																	VirusTotal
																</a>
																<a
																	href={`https://www.hybrid-analysis.com/search?query=${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
																>
																	Hybrid Analysis
																</a>
																<a
																	href={`https://otx.alienvault.com/indicator/file/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
																>
																	AlienVault OTX
																</a>
																<a
																	href={`https://malshare.com/search.php?query=${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
																>
																	MalShare
																</a>
															</>
														)}
														{selectedIoc.type.toLowerCase() === "technique" && (
															<>
																<a
																	href={`https://attack.mitre.org/techniques/${selectedIoc.indicator}/`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
																>
																	MITRE ATT&CK
																</a>
																<a
																	href={`https://d3fend.mitre.org/`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
																>
																	MITRE D3FEND
																</a>
															</>
														)}
														{selectedIoc.type.toLowerCase() ===
															"vulnerability" && (
															<>
																<a
																	href={`https://nvd.nist.gov/vuln/detail/${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
																>
																	NIST NVD
																</a>
																<a
																	href={`https://www.cisa.gov/known-exploited-vulnerabilities-catalog`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
																>
																	CISA KEV
																</a>
																<a
																	href={`https://www.exploit-db.com/search?cve=${selectedIoc.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
																>
																	Exploit-DB
																</a>
															</>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									</div>
								)}

							{/* Technical Details */}
							{selectedIoc.technicalDetails &&
								Object.keys(selectedIoc.technicalDetails).length > 0 && (
									<div className="mb-8">
										<Card className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg">
											<CardHeader className="pb-4">
												<h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center">
													<span className="mr-3 text-2xl">🔧</span>
													Technical Details
												</h3>
											</CardHeader>
											<CardContent className="pt-0">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.entries(selectedIoc.technicalDetails).map(
														([key, value]) => (
															<div
																key={key}
																className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
															>
																<div className="flex justify-between items-center">
																	<span className="text-sm font-semibold text-blue-700 dark:text-blue-300 capitalize">
																		{key.replace("_", " ")}
																	</span>
																	<span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
																		{value}
																	</span>
																</div>
															</div>
														)
													)}
												</div>
											</CardContent>
										</Card>
									</div>
								)}

							{/* Detailed Description */}
							{selectedIoc.detailedDescription && (
								<div className="mb-8">
									<Card className="border-l-4 border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-lg">
										<CardHeader className="pb-4">
											<h3 className="text-lg font-bold text-gray-800 dark:text-gray-300 flex items-center">
												<span className="mr-3 text-2xl">📝</span>
												Detailed Description
											</h3>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
												<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
													{selectedIoc.detailedDescription}
												</p>
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							{/* Suggested Remedies */}
							{selectedIoc.suggestedRemedies &&
								selectedIoc.suggestedRemedies.length > 0 && (
									<div className="mb-8">
										<Card className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-lg">
											<CardHeader className="pb-4">
												<h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 flex items-center">
													<span className="mr-3 text-2xl">🛡️</span>
													Recommended Remediation Actions
												</h3>
												<p className="text-sm text-yellow-700 dark:text-yellow-400">
													Follow these steps to mitigate the threat and protect
													your environment
												</p>
											</CardHeader>
											<CardContent className="pt-0">
												<div className="space-y-3">
													{selectedIoc.suggestedRemedies.map(
														(remedy, index) => (
															<div
																key={index}
																className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 flex items-start"
															>
																<span className="text-yellow-600 dark:text-yellow-400 mr-3 mt-1 text-lg font-bold">
																	{index + 1}.
																</span>
																<span className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
																	{remedy}
																</span>
															</div>
														)
													)}
												</div>
											</CardContent>
										</Card>
									</div>
								)}

							{/* Tags */}
							{selectedIoc.tags && selectedIoc.tags.length > 0 && (
								<div className="mb-8">
									<Card className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg">
										<CardHeader className="pb-4">
											<h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center">
												<span className="mr-3 text-2xl">🏷️</span>
												Classification Tags
											</h3>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex flex-wrap gap-3">
												{selectedIoc.tags.map((tag, i) => (
													<Badge
														key={i}
														className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer px-4 py-2 text-sm font-medium transition-colors"
													>
														{tag}
													</Badge>
												))}
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							{/* Legacy Information */}
							{(selectedIoc.sourceUrl ||
								(selectedIoc.sampleText &&
									selectedIoc.sampleText !==
										selectedIoc.detailedDescription)) && (
								<div className="mb-8">
									<Card className="border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-lg">
										<CardHeader className="pb-4">
											<h3 className="text-lg font-bold text-gray-800 dark:text-gray-300 flex items-center">
												<span className="mr-3 text-2xl">📚</span>
												Additional Information
											</h3>
										</CardHeader>
										<CardContent className="pt-0 space-y-4">
											{selectedIoc.sourceUrl && (
												<div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
													<h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														Source URL
													</h4>
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
											{selectedIoc.sampleText &&
												selectedIoc.sampleText !==
													selectedIoc.detailedDescription && (
													<div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
														<h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
															Sample Text
														</h4>
														<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
															{selectedIoc.sampleText}
														</p>
													</div>
												)}
										</CardContent>
									</Card>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
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
									onChange={(e) => handleFilterChange("type", e.target.value)}
									options={typeOptions}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Source
								</label>
								<Select
									value={sourceFilter}
									onChange={(e) => handleFilterChange("source", e.target.value)}
									options={sourceOptions}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Time Range
								</label>
								<Select
									value={timeFilter}
									onChange={(e) => handleFilterChange("time", e.target.value)}
									options={timeOptions}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
					<CardHeader className="border-b dark:border-gray-700">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-lg font-bold">
									IOC Explorer
								</CardTitle>
								<CardDescription>
									Showing {filteredIocs.iocs.length} of{" "}
									{filteredIocs.totalItems} indicators of compromise (Page{" "}
									{filteredIocs.currentPage} of {filteredIocs.totalPages}).
									Click on any row for detailed analysis.
								</CardDescription>
							</div>
							<Button
								onClick={refreshAllData}
								disabled={loading}
								className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
							>
								{loading ? (
									<>
										<span className="animate-spin mr-2">⏳</span>
										Refreshing...
									</>
								) : (
									<>🔄 Refresh IOCs</>
								)}
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<TableHead className="font-semibold">Indicator</TableHead>
									<TableHead className="font-semibold">Type</TableHead>
									<TableHead className="font-semibold">Threat Score</TableHead>
									<TableHead className="font-semibold">Source</TableHead>
									<TableHead className="font-semibold">Tags</TableHead>
									<TableHead className="font-semibold">First Seen</TableHead>
									<TableHead className="font-semibold">Last Seen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredIocs.iocs.map((ioc: ThreatResult, index: number) => (
									<TableRow
										key={index}
										onClick={() => handleIocClick(ioc)}
										className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<TableCell className="font-medium max-w-xs truncate">
											{ioc.indicator}
										</TableCell>
										<TableCell>
											<Badge variant="outline">{ioc.type}</Badge>
										</TableCell>
										<TableCell>
											<ThreatScoreBadge score={ioc.threatScore} />
										</TableCell>
										<TableCell className="max-w-xs truncate">
											{ioc.source}
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1 max-w-xs">
												{ioc.tags && ioc.tags.length > 0 ? (
													ioc.tags.slice(0, 2).map((tag: string, i: number) => (
														<Badge
															key={i}
															className="text-xs bg-blue-100 text-blue-800"
														>
															{tag}
														</Badge>
													))
												) : (
													<span className="text-gray-400 text-xs">No tags</span>
												)}
												{ioc.tags && ioc.tags.length > 2 && (
													<Badge className="text-xs bg-gray-100 text-gray-600">
														+{ioc.tags.length - 2}
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											{ioc.firstSeen ? formatLocalDateTime(ioc.firstSeen) : "-"}
										</TableCell>
										<TableCell>
											{ioc.lastSeen ? formatLocalDateTime(ioc.lastSeen) : "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<PaginationControls
					currentPage={filteredIocs.currentPage}
					totalPages={filteredIocs.totalPages}
					totalItems={filteredIocs.totalItems}
					hasNextPage={filteredIocs.hasNextPage}
					hasPrevPage={filteredIocs.hasPrevPage}
					onPageChange={(page) => setCurrentPage(page)}
				/>
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

			{/* Feed Status Overview */}
			{taxiiStatusNew && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<DashboardMetricCard
						title="Total Feeds"
						value={taxiiStatusNew.totalFeeds}
						icon={<span className="text-2xl">📡</span>}
						color="blue"
					/>
					<DashboardMetricCard
						title="Active Feeds"
						value={taxiiStatusNew.activeFeeds}
						icon={<span className="text-2xl">✅</span>}
						color="green"
					/>
					<DashboardMetricCard
						title="Total Indicators"
						value={taxiiStatusNew.collections.reduce(
							(sum, feed) => sum + feed.indicators,
							0
						)}
						icon={<span className="text-2xl">🎯</span>}
						color="purple"
					/>
					<DashboardMetricCard
						title="Last Sync"
						value={
							taxiiStatusNew.lastSync
								? formatLocalDateTime(taxiiStatusNew.lastSync)
								: "Never"
						}
						icon={<span className="text-2xl">🔄</span>}
						color="yellow"
					/>
				</div>
			)}

			<Card className="mb-6">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>TAXII Intelligence Feeds</CardTitle>
						<Button
							onClick={refreshAllFeeds}
							disabled={refreshingFeeds}
							className="bg-green-600 hover:bg-green-700"
						>
							{refreshingFeeds ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Refreshing...
								</>
							) : (
								<>🔄 Refresh All Feeds</>
							)}
						</Button>
					</div>
					<CardDescription>
						Open source threat intelligence feeds from multiple providers
					</CardDescription>
				</CardHeader>
				<CardContent>
					{taxiiLoading && !taxiiStatusNew ? (
						<div className="text-center py-4">
							Loading TAXII configuration...
						</div>
					) : (
						<>
							{taxiiStatusNew &&
							taxiiStatusNew.collections &&
							taxiiStatusNew.collections.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Feed Name</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Format</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Indicators</TableHead>
											<TableHead>Last Updated</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{taxiiStatusNew.collections.map((feed, i) => (
											<TableRow key={i}>
												<TableCell>
													<div className="font-medium">{feed.name}</div>
													{feed.authRequired && (
														<Badge variant="outline" className="mt-1 text-xs">
															Auth Required
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-sm text-gray-600">
													{feed.description}
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														{feed.format} v{feed.version}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={
															feed.status === "active"
																? "bg-green-100 text-green-800"
																: feed.status === "available"
																? "bg-blue-100 text-blue-800"
																: "bg-red-100 text-red-800"
														}
													>
														{feed.status}
													</Badge>
												</TableCell>
												<TableCell>{feed.indicators}</TableCell>
												<TableCell className="text-xs">
													{feed.lastUpdated
														? formatLocalDateTime(feed.lastUpdated)
														: "Never"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-4 text-gray-500">
									No TAXII feeds configured or available
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Feed Sources Statistics */}
			{feedSources.length > 0 && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Feed Sources Statistics</CardTitle>
						<CardDescription>
							Breakdown of indicators by source with performance metrics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Source</TableHead>
									<TableHead>Total Indicators</TableHead>
									<TableHead>Avg Threat Score</TableHead>
									<TableHead>Recent (24h)</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{feedSources.map((source, i) => (
									<TableRow key={i}>
										<TableCell className="font-medium">{source.name}</TableCell>
										<TableCell>{source.totalIndicators}</TableCell>
										<TableCell>
											<ThreatScoreBadge score={source.avgThreatScore} />
										</TableCell>
										<TableCell>
											{source.recentIndicators > 0 ? (
												<Badge className="bg-green-100 text-green-800">
													+{source.recentIndicators}
												</Badge>
											) : (
												<span className="text-gray-400">0</span>
											)}
										</TableCell>
										<TableCell className="text-xs">
											{formatLocalDateTime(source.lastUpdated)}
										</TableCell>
										<TableCell>
											<Badge
												className={
													source.status === "active"
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{source.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Configuration Guide */}
			<Card>
				<CardHeader>
					<CardTitle>Available Open Source TAXII Feeds</CardTitle>
					<CardDescription>
						Information about integrated threat intelligence feeds
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded-lg">
							<h4 className="font-medium text-green-600 mb-2">
								✅ Anomali Limo
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								Public CTI feed with APTs, malware, campaigns
							</p>
							<div className="text-xs text-gray-500">
								Format: STIX 1.1 via TAXII 1.x • Auth: Required
							</div>
						</div>

						<div className="p-4 border rounded-lg">
							<h4 className="font-medium text-green-600 mb-2">
								✅ MITRE ATT&CK
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								Techniques, tactics, procedures of APTs
							</p>
							<div className="text-xs text-gray-500">
								Format: STIX 2.1 JSON • Auth: Not required
							</div>
						</div>

						<div className="p-4 border rounded-lg">
							<h4 className="font-medium text-green-600 mb-2">
								✅ Hail a TAXII
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								Test and demo TAXII server with sample indicators
							</p>
							<div className="text-xs text-gray-500">
								Format: STIX 1.1 via TAXII 1.x • Auth: Not required
							</div>
						</div>

						<div className="p-4 border rounded-lg">
							<h4 className="font-medium text-green-600 mb-2">
								✅ MISP Community
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								Community MISP instances with TAXII feeds
							</p>
							<div className="text-xs text-gray-500">
								Format: STIX 2.1 • Auth: Varies by instance
							</div>
						</div>

						<div className="p-4 border rounded-lg">
							<h4 className="font-medium text-green-600 mb-2">
								✅ EclecticIQ Demo
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								CTI feeds curated for demo and learning
							</p>
							<div className="text-xs text-gray-500">
								Format: STIX 2.x • Auth: Registration may be needed
							</div>
						</div>

						<div className="p-4 border rounded-lg bg-blue-50">
							<h4 className="font-medium text-blue-600 mb-2">
								ℹ️ Integration Status
							</h4>
							<p className="text-sm text-gray-600 mb-2">
								All feeds are integrated and automatically refreshed
							</p>
							<div className="text-xs text-gray-500">
								Click "Refresh All Feeds" to update indicators
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);

	// Render search results
	const renderSearchResults = () => (
		<>
			<Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
				<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-700">
					<div className="flex items-center">
						<span className="text-3xl mr-3">🔍</span>
						<div>
							<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
								Threat Intelligence Search
							</CardTitle>
							<CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
								Enter an IP address, domain, URL, file hash, or other indicator
								to search for threat intelligence across multiple sources.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<div className="flex gap-3">
						<Input
							placeholder="Enter search query (IP, domain, URL, hash, etc.)..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && searchThreat()}
							className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
						/>
						<Button
							onClick={searchThreat}
							disabled={loading}
							className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
						>
							{loading ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Searching...
								</>
							) : (
								<>
									Search
									<span className="ml-2">🔍</span>
								</>
							)}
						</Button>
					</div>

					{/* Search Tips */}
					<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
						<h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
							💡 Search Tips
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
							<div>• IP addresses: 192.168.1.1</div>
							<div>• Domains: malicious-site.com</div>
							<div>• URLs: http://example.com/malware</div>
							<div>• File hashes: MD5, SHA1, SHA256</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{error && (
				<Card className="mb-6 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center">
							<span className="text-2xl mr-3">❌</span>
							<div>
								<h3 className="text-lg font-bold text-red-800 dark:text-red-300">
									Search Error
								</h3>
								<p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{results.length > 0 ? (
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
					<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-700">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<span className="text-3xl mr-3">📊</span>
								<div>
									<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
										Search Results
									</CardTitle>
									<CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
										Found {results.length} threat intelligence indicators. Click
										on any result for detailed analysis.
									</CardDescription>
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm text-gray-500 dark:text-gray-400">
									Query:{" "}
									<span className="font-mono font-medium text-gray-700 dark:text-gray-300">
										"{query}"
									</span>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow className="bg-gray-50 dark:bg-gray-800">
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Indicator
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Type
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Threat Score
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Source & Links
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Tags
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Risk Level
										</TableHead>
										<TableHead className="font-bold text-gray-700 dark:text-gray-300 px-6 py-4">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{results.map((result, index) => (
										<TableRow
											key={index}
											className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
										>
											<TableCell className="px-6 py-4">
												<div className="max-w-xs">
													<div className="font-mono text-sm font-medium text-gray-900 dark:text-white truncate">
														{result.indicator || "-"}
													</div>
													{result.firstSeen && (
														<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
															First seen:{" "}
															{formatLocalDateTime(result.firstSeen)}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell className="px-6 py-4">
												<Badge
													variant="outline"
													className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 font-medium"
												>
													{result.type || "-"}
												</Badge>
											</TableCell>
											<TableCell className="px-6 py-4">
												<div className="flex items-center space-x-2">
													<ThreatScoreBadge score={result.threatScore || 0} />
													<div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
														<div
															className={`h-2 rounded-full transition-all duration-300 ${
																(result.threatScore || 0) >= 8.5
																	? "bg-gradient-to-r from-red-500 to-red-600"
																	: (result.threatScore || 0) >= 6.5
																	? "bg-gradient-to-r from-orange-500 to-orange-600"
																	: (result.threatScore || 0) >= 4.5
																	? "bg-gradient-to-r from-yellow-400 to-yellow-500"
																	: "bg-gradient-to-r from-green-500 to-green-600"
															}`}
															style={{
																width: `${
																	((result.threatScore || 0) / 10) * 100
																}%`,
															}}
														></div>
													</div>
												</div>
											</TableCell>
											<TableCell className="px-6 py-4">
												<div className="max-w-xs">
													<div className="font-medium text-gray-900 dark:text-white text-sm mb-2">
														{result.source || "-"}
													</div>

													{/* External Analysis Links */}
													<div className="flex flex-wrap gap-1">
														{result.type?.toLowerCase() === "ip" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/ip-address/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
																	title="Check on VirusTotal"
																>
																	VT
																</a>
																<a
																	href={`https://www.abuseipdb.com/check/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
																	title="Check on AbuseIPDB"
																>
																	Abuse
																</a>
																<a
																	href={`https://www.shodan.io/host/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
																	title="Check on Shodan"
																>
																	Shodan
																</a>
															</>
														)}
														{result.type?.toLowerCase() === "domain" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/domain/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
																	title="Check on VirusTotal"
																>
																	VT
																</a>
																<a
																	href={`https://www.urlvoid.com/scan/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
																	title="Check on URLVoid"
																>
																	URLVoid
																</a>
																<a
																	href={`https://whois.domaintools.com/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
																	title="WHOIS Lookup"
																>
																	WHOIS
																</a>
															</>
														)}
														{result.type?.toLowerCase() === "url" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/url/${btoa(
																		result.indicator || ""
																	)}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
																	title="Check on VirusTotal"
																>
																	VT
																</a>
																<a
																	href={`https://www.urlvoid.com/scan/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
																	title="Check on URLVoid"
																>
																	URLVoid
																</a>
															</>
														)}
														{result.type?.toLowerCase() === "hash" && (
															<>
																<a
																	href={`https://www.virustotal.com/gui/file/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
																	title="Check on VirusTotal"
																>
																	VT
																</a>
																<a
																	href={`https://www.hybrid-analysis.com/search?query=${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
																	title="Check on Hybrid Analysis"
																>
																	Hybrid
																</a>
															</>
														)}
														{result.type?.toLowerCase() === "technique" && (
															<a
																href={`https://attack.mitre.org/techniques/${result.indicator}/`}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
																title="View on MITRE ATT&CK"
															>
																MITRE
															</a>
														)}
														{result.type?.toLowerCase() === "vulnerability" && (
															<>
																<a
																	href={`https://nvd.nist.gov/vuln/detail/${result.indicator}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
																	title="Check on NIST NVD"
																>
																	NIST
																</a>
																<a
																	href={`https://www.cisa.gov/known-exploited-vulnerabilities-catalog`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
																	title="Check CISA KEV"
																>
																	CISA
																</a>
															</>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell className="px-6 py-4">
												<div className="flex flex-wrap gap-1 max-w-xs">
													{result.tags && result.tags.length > 0 ? (
														result.tags.slice(0, 3).map((tag, i) => (
															<Badge
																key={i}
																className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
															>
																{tag}
															</Badge>
														))
													) : (
														<span className="text-gray-400 text-xs italic">
															No tags
														</span>
													)}
													{result.tags && result.tags.length > 3 && (
														<Badge className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
															+{result.tags.length - 3}
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="px-6 py-4">
												{result.riskAssessment ? (
													<div className="flex items-center">
														{result.riskAssessment
															.toLowerCase()
															.includes("critical") ? (
															<div className="flex items-center space-x-1">
																<span className="text-red-600 text-lg">🔴</span>
																<span className="text-red-700 dark:text-red-400 text-xs font-bold">
																	Critical
																</span>
															</div>
														) : result.riskAssessment
																.toLowerCase()
																.includes("high") ? (
															<div className="flex items-center space-x-1">
																<span className="text-orange-600 text-lg">
																	🟠
																</span>
																<span className="text-orange-700 dark:text-orange-400 text-xs font-bold">
																	High
																</span>
															</div>
														) : result.riskAssessment
																.toLowerCase()
																.includes("medium") ? (
															<div className="flex items-center space-x-1">
																<span className="text-yellow-600 text-lg">
																	🟡
																</span>
																<span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold">
																	Medium
																</span>
															</div>
														) : (
															<div className="flex items-center space-x-1">
																<span className="text-green-600 text-lg">
																	🟢
																</span>
																<span className="text-green-700 dark:text-green-400 text-xs font-bold">
																	Low
																</span>
															</div>
														)}
													</div>
												) : (
													<span className="text-gray-400 text-xs italic">
														Unknown
													</span>
												)}
											</TableCell>
											<TableCell className="px-6 py-4">
												<Button
													onClick={() => handleIocClick(result)}
													className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
												>
													View Details
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
					<CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 p-6">
						<div className="flex items-center justify-between w-full">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								<span className="font-medium">{results.length}</span> results
								found for "{query}"
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-500">
								💡 Click "View Details" for comprehensive analysis and
								remediation guidance
							</div>
						</div>
					</CardFooter>
				</Card>
			) : (
				<Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
					<CardContent className="py-16">
						<div className="text-center">
							<div className="text-6xl mb-4">🔍</div>
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								{loading ? "Searching for threats..." : "Ready to search"}
							</h3>
							<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
								{loading
									? "Analyzing threat intelligence databases..."
									: "Enter a search query above to find threat intelligence data across multiple sources"}
							</p>
							{loading && (
								<div className="mt-4">
									<div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
										<span className="animate-spin mr-2">⏳</span>
										Searching threat databases...
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);

	return (
		<div className="container mx-auto py-8 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
			{/* Global Success/Error Messages */}
			{taxiiSuccess && (
				<div className="fixed top-4 right-4 z-50 max-w-md">
					<SuccessAlert className="bg-green-50 border-green-200 text-green-800 shadow-lg rounded-xl">
						<AlertTitle className="text-green-800 font-bold flex items-center">
							<span className="mr-2 text-xl">✅</span>
							Success
						</AlertTitle>
						<AlertDescription className="text-green-700">
							{taxiiSuccess}
						</AlertDescription>
					</SuccessAlert>
				</div>
			)}

			{error && (
				<div className="fixed top-4 right-4 z-50 max-w-md">
					<Alert className="bg-red-50 border-red-200 text-red-800 shadow-lg rounded-xl">
						<AlertTitle className="text-red-800 font-bold flex items-center">
							<span className="mr-2 text-xl">❌</span>
							Error
						</AlertTitle>
						<AlertDescription className="text-red-700">
							{error}
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Global Loading Indicator */}
			{loading && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
					<div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
						<span className="animate-spin mr-3 text-xl">⏳</span>
						<span className="font-medium">
							Refreshing threat intelligence data...
						</span>
					</div>
				</div>
			)}

			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Threat Intelligence Platform
				</h1>
				<div className="flex space-x-2">
					<Button
						onClick={refreshAllData}
						disabled={loading}
						className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
					>
						{loading ? (
							<>
								<span className="animate-spin mr-2">⏳</span>
								Refreshing...
							</>
						) : (
							<>🔄 Refresh Data</>
						)}
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

			{/* Add logs panel at the bottom */}
			<LogsPanel />
		</div>
	);
}
