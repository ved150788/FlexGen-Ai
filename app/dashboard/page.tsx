"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	User,
	Settings,
	History,
	Shield,
	LogOut,
	Edit,
	Save,
	X,
	Mail,
	Bell,
	Moon,
	Sun,
	Globe,
	Clock,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
	ExternalLink,
	Calendar,
	Target,
	Activity,
} from "lucide-react";
import {
	authAPI,
	User as UserType,
	ScanResult,
	UserPreferences,
} from "@/lib/auth";
import { SidebarFeedbackNavigation } from "@/components/navigation/FeedbackNavigation";

export default function DashboardPage() {
	const [user, setUser] = useState<UserType | null>(null);
	const [scans, setScans] = useState<ScanResult[]>([]);
	const [preferences, setPreferences] = useState<UserPreferences>({
		emailNotifications: true,
		securityAlerts: true,
		marketingEmails: false,
		theme: "dark",
		language: "en",
		timezone: "UTC",
	});

	const [activeTab, setActiveTab] = useState<
		"overview" | "profile" | "history" | "settings"
	>("overview");
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState({
		firstName: "",
		lastName: "",
		avatar: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const router = useRouter();

	useEffect(() => {
		if (!authAPI.isAuthenticated()) {
			router.push("/login");
			return;
		}

		fetchUserData();
		fetchScanHistory();
		fetchPreferences();
	}, [router]);

	const fetchUserData = async () => {
		try {
			const data = await authAPI.getProfile();
			setUser(data.user);
			setProfileData({
				firstName: data.user.firstName || "",
				lastName: data.user.lastName || "",
				avatar: data.user.avatar || "",
			});
		} catch (error) {
			setError("Failed to load user data");
			console.error("Failed to fetch user data:", error);
		}
	};

	const fetchScanHistory = async () => {
		try {
			const data = await authAPI.getScanHistory(1, 10);
			setScans(data.scans);
		} catch (error) {
			console.error("Failed to fetch scan history:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchPreferences = async () => {
		try {
			const data = await authAPI.getPreferences();
			if (data.preferences) {
				setPreferences({ ...preferences, ...data.preferences });
			}
		} catch (error) {
			console.error("Failed to fetch preferences:", error);
		}
	};

	const handleProfileUpdate = async () => {
		try {
			await authAPI.updateProfile(profileData);
			setSuccess("Profile updated successfully");
			setIsEditingProfile(false);
			fetchUserData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError("Failed to update profile");
			console.error("Failed to update profile:", error);
		}
	};

	const handlePreferencesUpdate = async () => {
		try {
			await authAPI.updatePreferences(preferences);
			setSuccess("Preferences updated successfully");
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError("Failed to update preferences");
			console.error("Failed to update preferences:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await authAPI.logout();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			// Force logout even if API call fails
			authAPI.removeToken();
			router.push("/login");
		}
	};

	const getRiskLevelColor = (riskLevel: string) => {
		switch (riskLevel?.toLowerCase()) {
			case "high":
				return "text-red-400 bg-red-500/20";
			case "medium":
				return "text-yellow-400 bg-yellow-500/20";
			case "low":
				return "text-green-400 bg-green-500/20";
			default:
				return "text-gray-400 bg-gray-500/20";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		);
	}

	const totalScans = scans.length;
	const highRiskScans = scans.filter(
		(scan) => scan.riskLevel?.toLowerCase() === "high"
	).length;
	const totalThreats = scans.reduce(
		(sum, scan) => sum + (scan.threatsFound || 0),
		0
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
			<div className="flex">
				{/* Sidebar */}
				<div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 min-h-screen p-6">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
							<Shield className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-white font-bold text-lg">FlexGen AI</h1>
							<p className="text-gray-400 text-sm">Security Dashboard</p>
						</div>
					</div>

					<nav className="space-y-2">
						<button
							onClick={() => setActiveTab("overview")}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								activeTab === "overview"
									? "bg-white/20 text-white"
									: "text-gray-300 hover:bg-white/10 hover:text-white"
							}`}
						>
							<Activity className="w-5 h-5" />
							Overview
						</button>

						<button
							onClick={() => setActiveTab("profile")}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								activeTab === "profile"
									? "bg-white/20 text-white"
									: "text-gray-300 hover:bg-white/10 hover:text-white"
							}`}
						>
							<User className="w-5 h-5" />
							Profile
						</button>

						<button
							onClick={() => setActiveTab("history")}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								activeTab === "history"
									? "bg-white/20 text-white"
									: "text-gray-300 hover:bg-white/10 hover:text-white"
							}`}
						>
							<History className="w-5 h-5" />
							Scan History
						</button>

						<button
							onClick={() => setActiveTab("settings")}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								activeTab === "settings"
									? "bg-white/20 text-white"
									: "text-gray-300 hover:bg-white/10 hover:text-white"
							}`}
						>
							<Settings className="w-5 h-5" />
							Settings
						</button>
					</nav>

					<div className="mt-auto pt-8 space-y-2">
						<SidebarFeedbackNavigation className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors" />
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
						>
							<LogOut className="w-5 h-5" />
							Logout
						</button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-8">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold text-white mb-2">
								{activeTab === "overview" && "Dashboard Overview"}
								{activeTab === "profile" && "User Profile"}
								{activeTab === "history" && "Scan History"}
								{activeTab === "settings" && "Settings"}
							</h2>
							<p className="text-gray-400">
								Welcome back, {user?.firstName || "User"}!
							</p>
						</div>

						{user && (
							<div className="flex items-center gap-3">
								<div className="text-right">
									<p className="text-white font-medium">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-gray-400 text-sm">{user.email}</p>
								</div>
								<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
									{user.avatar ? (
										<img
											src={user.avatar}
											alt="Avatar"
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<User className="w-6 h-6 text-white" />
									)}
								</div>
							</div>
						)}
					</div>

					{/* Success/Error Messages */}
					{error && (
						<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
							{error}
						</div>
					)}

					{success && (
						<div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">
							{success}
						</div>
					)}

					{/* Content based on active tab */}
					{activeTab === "overview" && (
						<div className="space-y-6">
							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-gray-400 text-sm">Total Scans</p>
											<p className="text-3xl font-bold text-white">
												{totalScans}
											</p>
										</div>
										<div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
											<Target className="w-6 h-6 text-blue-400" />
										</div>
									</div>
								</div>

								<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-gray-400 text-sm">High Risk Scans</p>
											<p className="text-3xl font-bold text-red-400">
												{highRiskScans}
											</p>
										</div>
										<div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
											<AlertTriangle className="w-6 h-6 text-red-400" />
										</div>
									</div>
								</div>

								<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-gray-400 text-sm">Threats Found</p>
											<p className="text-3xl font-bold text-yellow-400">
												{totalThreats}
											</p>
										</div>
										<div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
											<Shield className="w-6 h-6 text-yellow-400" />
										</div>
									</div>
								</div>
							</div>

							{/* Recent Scans */}
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
								<h3 className="text-xl font-semibold text-white mb-4">
									Recent Scans
								</h3>
								{scans.length === 0 ? (
									<p className="text-gray-400">
										No scans performed yet. Start by running your first security
										scan!
									</p>
								) : (
									<div className="space-y-3">
										{scans.slice(0, 5).map((scan) => (
											<div
												key={scan.id}
												className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
											>
												<div className="flex items-center gap-3">
													<div
														className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
															scan.riskLevel
														)}`}
													>
														{scan.riskLevel || "Unknown"}
													</div>
													<div>
														<p className="text-white font-medium">
															{scan.scanType}
														</p>
														<p className="text-gray-400 text-sm">
															{scan.targetUrl || scan.targetIp}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-white text-sm">
														{scan.threatsFound || 0} threats
													</p>
													<p className="text-gray-400 text-xs">
														{formatDate(scan.createdAt)}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "profile" && user && (
						<div className="max-w-2xl">
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-semibold text-white">
										Profile Information
									</h3>
									<button
										onClick={() => setIsEditingProfile(!isEditingProfile)}
										className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
									>
										{isEditingProfile ? (
											<>
												<X className="w-4 h-4" />
												Cancel
											</>
										) : (
											<>
												<Edit className="w-4 h-4" />
												Edit
											</>
										)}
									</button>
								</div>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-gray-300 text-sm font-medium mb-2">
												First Name
											</label>
											{isEditingProfile ? (
												<input
													type="text"
													value={profileData.firstName}
													onChange={(e) =>
														setProfileData({
															...profileData,
															firstName: e.target.value,
														})
													}
													className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<p className="text-white">{user.firstName}</p>
											)}
										</div>

										<div>
											<label className="block text-gray-300 text-sm font-medium mb-2">
												Last Name
											</label>
											{isEditingProfile ? (
												<input
													type="text"
													value={profileData.lastName}
													onChange={(e) =>
														setProfileData({
															...profileData,
															lastName: e.target.value,
														})
													}
													className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<p className="text-white">{user.lastName}</p>
											)}
										</div>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Email
										</label>
										<p className="text-white">{user.email}</p>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Account Created
										</label>
										<p className="text-white">{formatDate(user.createdAt)}</p>
									</div>

									<div>
										<label className="block text-gray-300 text-sm font-medium mb-2">
											Last Login
										</label>
										<p className="text-white">{formatDate(user.lastLogin)}</p>
									</div>

									{isEditingProfile && (
										<button
											onClick={handleProfileUpdate}
											className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
										>
											<Save className="w-4 h-4" />
											Save Changes
										</button>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === "history" && (
						<div className="space-y-6">
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
								<h3 className="text-xl font-semibold text-white mb-4">
									Scan History
								</h3>
								{scans.length === 0 ? (
									<p className="text-gray-400">No scan history available.</p>
								) : (
									<div className="space-y-4">
										{scans.map((scan) => (
											<div
												key={scan.id}
												className="p-4 bg-white/5 rounded-lg border border-white/10"
											>
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-3">
														<div
															className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
																scan.riskLevel
															)}`}
														>
															{scan.riskLevel || "Unknown"}
														</div>
														<h4 className="text-white font-medium">
															{scan.scanType}
														</h4>
													</div>
													<p className="text-gray-400 text-sm">
														{formatDate(scan.createdAt)}
													</p>
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div>
														<p className="text-gray-400">Target</p>
														<p className="text-white">
															{scan.targetUrl || scan.targetIp || "N/A"}
														</p>
													</div>
													<div>
														<p className="text-gray-400">Threats Found</p>
														<p className="text-white">
															{scan.threatsFound || 0}
														</p>
													</div>
													<div>
														<p className="text-gray-400">Duration</p>
														<p className="text-white">
															{scan.scanDuration || 0}s
														</p>
													</div>
													<div>
														<p className="text-gray-400">Status</p>
														<div className="flex items-center gap-1">
															<CheckCircle className="w-4 h-4 text-green-400" />
															<span className="text-green-400">Completed</span>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "settings" && (
						<div className="max-w-2xl space-y-6">
							{/* Notifications */}
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
								<h3 className="text-xl font-semibold text-white mb-4">
									Notification Preferences
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Mail className="w-5 h-5 text-gray-400" />
											<div>
												<p className="text-white">Email Notifications</p>
												<p className="text-gray-400 text-sm">
													Receive email updates about your account
												</p>
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.emailNotifications}
												onChange={(e) =>
													setPreferences({
														...preferences,
														emailNotifications: e.target.checked,
													})
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Bell className="w-5 h-5 text-gray-400" />
											<div>
												<p className="text-white">Security Alerts</p>
												<p className="text-gray-400 text-sm">
													Get notified about security threats
												</p>
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.securityAlerts}
												onChange={(e) =>
													setPreferences({
														...preferences,
														securityAlerts: e.target.checked,
													})
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
								</div>
							</div>

							{/* Appearance */}
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
								<h3 className="text-xl font-semibold text-white mb-4">
									Appearance
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Moon className="w-5 h-5 text-gray-400" />
											<div>
												<p className="text-white">Theme</p>
												<p className="text-gray-400 text-sm">
													Choose your preferred theme
												</p>
											</div>
										</div>
										<select
											value={preferences.theme}
											onChange={(e) =>
												setPreferences({
													...preferences,
													theme: e.target.value as "light" | "dark",
												})
											}
											className="px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="dark">Dark</option>
											<option value="light">Light</option>
										</select>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Globe className="w-5 h-5 text-gray-400" />
											<div>
												<p className="text-white">Language</p>
												<p className="text-gray-400 text-sm">
													Select your language preference
												</p>
											</div>
										</div>
										<select
											value={preferences.language}
											onChange={(e) =>
												setPreferences({
													...preferences,
													language: e.target.value,
												})
											}
											className="px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="en">English</option>
											<option value="es">Español</option>
											<option value="fr">Français</option>
											<option value="de">Deutsch</option>
										</select>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Clock className="w-5 h-5 text-gray-400" />
											<div>
												<p className="text-white">Timezone</p>
												<p className="text-gray-400 text-sm">
													Set your timezone for accurate timestamps
												</p>
											</div>
										</div>
										<select
											value={preferences.timezone}
											onChange={(e) =>
												setPreferences({
													...preferences,
													timezone: e.target.value,
												})
											}
											className="px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="UTC">UTC</option>
											<option value="America/New_York">Eastern Time</option>
											<option value="America/Chicago">Central Time</option>
											<option value="America/Denver">Mountain Time</option>
											<option value="America/Los_Angeles">Pacific Time</option>
										</select>
									</div>
								</div>
							</div>

							<button
								onClick={handlePreferencesUpdate}
								className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
							>
								<Save className="w-4 h-4" />
								Save Settings
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
