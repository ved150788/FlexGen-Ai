"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Settings,
	Filter,
	RefreshCw,
	Search,
	Calendar,
	User,
	MessageSquare,
	Star,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	CheckCircle,
	Clock,
	AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";

interface Feedback {
	id: string;
	title: string;
	description: string;
	rating: number;
	category: string;
	module: string;
	status: string;
	priority: string;
	userId: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		username: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
	resolvedAt?: string;
}

interface FeedbackFilters {
	search: string;
	status: string;
	module: string;
	category: string;
	rating: string;
	dateFrom: string;
	dateTo: string;
}

export default function FeedbackDashboard() {
	const { user, isAdmin, loading: authLoading } = useAuth();
	const router = useRouter();

	const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);

	const [filters, setFilters] = useState<FeedbackFilters>({
		search: "",
		status: "",
		module: "",
		category: "",
		rating: "",
		dateFrom: "",
		dateTo: "",
	});

	// Redirect non-admin users to my-feedback page
	useEffect(() => {
		if (!authLoading && user && !isAdmin) {
			router.replace("/my-feedback");
		}
	}, [user, isAdmin, authLoading, router]);

	const fetchFeedback = async () => {
		if (!user || !isAdmin) return;

		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: "20",
				...Object.fromEntries(
					Object.entries(filters).filter(([_, value]) => value)
				),
			});

			const response = await fetch(`/api/feedback/dashboard?${params}`, {
				headers: {
					Authorization: `Bearer ${user.token || ""}`,
				},
			});

			if (response.ok) {
				const result = await response.json();
				setFeedbackList(result.data || []);
				setTotalCount(result.meta?.total || 0);
			} else {
				console.error("Failed to fetch feedback");
			}
		} catch (error) {
			console.error("Error fetching feedback:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFeedback();
	}, [currentPage, user]);

	const handleFilterChange = (key: keyof FeedbackFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const applyFilters = () => {
		setCurrentPage(1);
		fetchFeedback();
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			status: "",
			module: "",
			category: "",
			rating: "",
			dateFrom: "",
			dateTo: "",
		});
		setCurrentPage(1);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "OPEN":
				return <Clock size={16} className="text-blue-500" />;
			case "IN_PROGRESS":
				return <RefreshCw size={16} className="text-yellow-500" />;
			case "RESOLVED":
				return <CheckCircle size={16} className="text-green-500" />;
			case "CLOSED":
				return <CheckCircle size={16} className="text-gray-500" />;
			default:
				return <AlertTriangle size={16} className="text-gray-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "OPEN":
				return "bg-blue-100 text-blue-800";
			case "IN_PROGRESS":
				return "bg-yellow-100 text-yellow-800";
			case "RESOLVED":
				return "bg-green-100 text-green-800";
			case "CLOSED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getRatingStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				size={14}
				className={`${
					i < rating ? "text-yellow-500 fill-current" : "text-gray-300"
				}`}
			/>
		));
	};

	// Show loading or redirect for non-admin users
	if (authLoading || !user || !isAdmin) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 flex items-center">
								<Settings size={28} className="mr-3 text-blue-600" />
								Feedback Dashboard
							</h1>
							<p className="mt-1 text-sm text-gray-600">
								Manage and review all feedback submissions ({totalCount} total)
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								<Filter size={16} className="mr-2" />
								Filters
							</button>
							<button
								onClick={fetchFeedback}
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
							>
								<RefreshCw size={16} className="mr-2" />
								Refresh
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<div className="bg-white border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Search
								</label>
								<input
									type="text"
									value={filters.search}
									onChange={(e) => handleFilterChange("search", e.target.value)}
									placeholder="Search feedback..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Status
								</label>
								<select
									value={filters.status}
									onChange={(e) => handleFilterChange("status", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								>
									<option value="">All Statuses</option>
									<option value="OPEN">Open</option>
									<option value="IN_PROGRESS">In Progress</option>
									<option value="RESOLVED">Resolved</option>
									<option value="CLOSED">Closed</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Module
								</label>
								<select
									value={filters.module}
									onChange={(e) => handleFilterChange("module", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								>
									<option value="">All Modules</option>
									<option value="Dashboard">Dashboard</option>
									<option value="API Fuzzer">API Fuzzer</option>
									<option value="AI Recon Bot">AI Recon Bot</option>
									<option value="Vulnerability Scanner">
										Vulnerability Scanner
									</option>
									<option value="Threat Intelligence">
										Threat Intelligence
									</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Category
								</label>
								<select
									value={filters.category}
									onChange={(e) =>
										handleFilterChange("category", e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								>
									<option value="">All Categories</option>
									<option value="BUG">Bug</option>
									<option value="FEATURE_REQUEST">Feature Request</option>
									<option value="IMPROVEMENT">Improvement</option>
									<option value="QUESTION">Question</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Rating
								</label>
								<select
									value={filters.rating}
									onChange={(e) => handleFilterChange("rating", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								>
									<option value="">All Ratings</option>
									<option value="5">5 Stars</option>
									<option value="4">4 Stars</option>
									<option value="3">3 Stars</option>
									<option value="2">2 Stars</option>
									<option value="1">1 Star</option>
								</select>
							</div>
							<div className="flex items-end space-x-2">
								<button
									onClick={applyFilters}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Apply
								</button>
								<button
									onClick={clearFilters}
									className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading feedback...</p>
					</div>
				) : feedbackList.length === 0 ? (
					<div className="text-center py-12">
						<MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No feedback found
						</h3>
						<p className="text-gray-600">
							Try adjusting your filters or check back later.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{feedbackList.map((feedback) => (
							<div
								key={feedback.id}
								className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
							>
								<div className="p-6">
									{/* Header */}
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<div className="flex items-center space-x-3 mb-2">
												<h3 className="text-lg font-medium text-gray-900">
													{feedback.title}
												</h3>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
														feedback.status
													)}`}
												>
													{getStatusIcon(feedback.status)}
													<span className="ml-1">{feedback.status}</span>
												</span>
											</div>
											<div className="flex items-center space-x-4 text-sm text-gray-600">
												<span className="flex items-center">
													<User size={14} className="mr-1" />
													{feedback.user.firstName} {feedback.user.lastName}
												</span>
												<span className="flex items-center">
													<span className="font-medium text-gray-700 mr-1">
														Module:
													</span>
													{feedback.module}
												</span>
												<span className="flex items-center">
													<Calendar size={14} className="mr-1" />
													{new Date(feedback.createdAt).toLocaleDateString()}
												</span>
												{feedback.rating > 0 && (
													<div className="flex items-center space-x-1">
														{getRatingStars(feedback.rating)}
													</div>
												)}
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<button className="p-2 text-gray-400 hover:text-gray-600">
												<Eye size={16} />
											</button>
											<button className="p-2 text-gray-400 hover:text-gray-600">
												<Edit size={16} />
											</button>
											<button className="p-2 text-gray-400 hover:text-red-600">
												<Trash2 size={16} />
											</button>
											<button className="p-2 text-gray-400 hover:text-gray-600">
												<MoreVertical size={16} />
											</button>
										</div>
									</div>

									{/* Description */}
									<p className="text-gray-700 mb-4 line-clamp-3">
										{feedback.description}
									</p>

									{/* Footer */}
									<div className="flex items-center justify-between text-sm text-gray-500">
										<span>ID: {feedback.id}</span>
										<span>
											Updated:{" "}
											{new Date(feedback.updatedAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{totalCount > 20 && (
					<div className="mt-8 flex items-center justify-between">
						<div className="text-sm text-gray-700">
							Showing {(currentPage - 1) * 20 + 1} to{" "}
							{Math.min(currentPage * 20, totalCount)} of {totalCount} results
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage === 1}
								className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Previous
							</button>
							<span className="px-3 py-2 text-sm">
								Page {currentPage} of {Math.ceil(totalCount / 20)}
							</span>
							<button
								onClick={() => setCurrentPage((prev) => prev + 1)}
								disabled={currentPage >= Math.ceil(totalCount / 20)}
								className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
